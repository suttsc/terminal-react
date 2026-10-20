import { describe, expect, it, vi } from 'vitest'
import { HttpStravaClient } from '@/integrations/strava/http-strava-client'

function setUp(stored: string | null = null) {
  const tokens = { value: stored }
  const fetchImpl = vi.fn<typeof fetch>(async (input) => {
    const url = String(input)

    if (url === 'https://www.strava.com/oauth/token') {
      return Response.json({ access_token: 'access', refresh_token: 'rotated' })
    }

    return Response.json([
      {
        id: 42,
        name: 'Lunch Run',
        sport_type: 'Run',
        distance: 5012.4,
        moving_time: 1500,
        total_elevation_gain: 12.6,
        start_date: '2026-10-09T12:00:00Z',
      },
    ])
  })
  const client = new HttpStravaClient({
    clientId: 'client',
    clientSecret: 'secret',
    seedRefreshToken: 'from-env',
    fetch: fetchImpl,
    tokens: {
      get: async () => tokens.value,
      set: async (token) => void (tokens.value = token),
    },
  })

  return { client, fetchImpl, tokens }
}

describe('the HTTP Strava client', () => {
  it('refreshes the token, keeps the rotated one and fetches activities', async () => {
    const { client, fetchImpl, tokens } = setUp()
    const since = new Date('2026-09-26T12:00:00Z')

    await expect(client.activitiesSince(since)).resolves.toEqual([
      {
        stravaId: 42,
        name: 'Lunch Run',
        sportType: 'Run',
        distanceMetres: 5012,
        movingSeconds: 1500,
        elevationMetres: 13,
        startedAt: new Date('2026-10-09T12:00:00Z'),
      },
    ])
    expect(tokens.value).toBe('rotated')

    const [tokenUrl, tokenInit] = fetchImpl.mock.calls[0] ?? []
    expect(tokenUrl).toBe('https://www.strava.com/oauth/token')
    expect(Object.fromEntries(tokenInit?.body as URLSearchParams)).toEqual({
      client_id: 'client',
      client_secret: 'secret',
      grant_type: 'refresh_token',
      refresh_token: 'from-env',
    })

    const [activitiesUrl, activitiesInit] = fetchImpl.mock.calls[1] ?? []
    const url = new URL(String(activitiesUrl))
    expect(url.pathname).toBe('/api/v3/athlete/activities')
    expect(url.searchParams.get('after')).toBe(String(since.getTime() / 1000))
    expect(url.searchParams.get('per_page')).toBe('100')
    expect(activitiesInit?.headers).toEqual({ Authorization: 'Bearer access' })
  })

  it('uses the rotated refresh token on the next run', async () => {
    const { client, fetchImpl } = setUp('rotated-before')

    await client.activitiesSince(new Date())

    const body = fetchImpl.mock.calls[0]?.[1]?.body as URLSearchParams
    expect(body.get('refresh_token')).toBe('rotated-before')
  })

  it('throws when Strava says no', async () => {
    const { client, fetchImpl } = setUp()
    fetchImpl.mockResolvedValueOnce(new Response('nope', { status: 401 }))

    await expect(client.activitiesSince(new Date())).rejects.toThrow('401')
  })
})
