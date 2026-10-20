import type { StravaActivityData } from '@/repositories/types'
import type { RefreshTokenStore, StravaClient } from '@/integrations/strava/strava-client'

type ApiActivity = {
  id: number
  name: string
  sport_type: string
  distance: number
  moving_time: number
  total_elevation_gain: number
  start_date: string
}

export const fromApi = (activity: ApiActivity): StravaActivityData => ({
  stravaId: activity.id,
  name: activity.name,
  sportType: activity.sport_type,
  distanceMetres: Math.round(activity.distance),
  movingSeconds: activity.moving_time,
  elevationMetres: Math.round(activity.total_elevation_gain),
  startedAt: new Date(activity.start_date),
})

const TIMEOUT_MS = 10_000

/**
 * Talks to Strava from the cron route only. Never construct this in a request
 * a visitor is waiting on.
 */
export class HttpStravaClient implements StravaClient {
  constructor(
    private readonly options: {
      clientId: string
      clientSecret: string
      /** Used only until a rotated token has been stored. */
      seedRefreshToken: string | null
      tokens: RefreshTokenStore
      fetch?: typeof fetch
    },
  ) {}

  async activitiesSince(since: Date): Promise<StravaActivityData[]> {
    const url = new URL('https://www.strava.com/api/v3/athlete/activities')
    url.searchParams.set('after', String(Math.floor(since.getTime() / 1000)))
    url.searchParams.set('per_page', '100')

    const response = await this.http(url, {
      headers: { Authorization: `Bearer ${await this.accessToken()}` },
    })

    return ((await response.json()) as ApiActivity[]).map(fromApi)
  }

  /**
   * Strava rotates the refresh token on every use, so the latest one is kept.
   */
  private async accessToken(): Promise<string> {
    const refreshToken = (await this.options.tokens.get()) ?? this.options.seedRefreshToken

    if (!refreshToken) {
      throw new Error('Strava has no refresh token to work with.')
    }

    const response = await this.http('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.options.clientId,
        client_secret: this.options.clientSecret,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    })
    const tokens = (await response.json()) as { access_token: string; refresh_token: string }

    await this.options.tokens.set(tokens.refresh_token)

    return tokens.access_token
  }

  private async http(url: string | URL, init: RequestInit): Promise<Response> {
    const response = await (this.options.fetch ?? fetch)(url, {
      ...init,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })

    if (!response.ok) {
      throw new Error(`Strava answered ${response.status} for ${new URL(url).pathname}.`)
    }

    return response
  }
}
