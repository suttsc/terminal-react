import { describe, expect, it, vi } from 'vitest'
import { cronRoute } from '@/http/cron'

const request = (authorization?: string) =>
  new Request('https://suttsc.com/api/cron/strava', {
    headers: authorization ? { authorization } : {},
  })

describe('cron routes', () => {
  it('run the job for Vercel', async () => {
    const job = vi.fn(async () => ({ synced: 2 }))
    const response = await cronRoute(job)(request('Bearer test-cron-secret'))

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({ synced: 2 })
  })

  it.each([undefined, 'Bearer wrong', 'test-cron-secret', 'bearer test-cron-secret'])(
    'return 401 for authorization %j',
    async (authorization) => {
      const job = vi.fn(async () => ({}))
      const response = await cronRoute(job)(request(authorization))

      expect(response.status).toBe(401)
      expect(job).not.toHaveBeenCalled()
    },
  )

  it('return 401 to everyone when no secret is configured', async () => {
    vi.stubEnv('CRON_SECRET', '')
    const job = vi.fn(async () => ({}))

    expect((await cronRoute(job)(request('Bearer '))).status).toBe(401)
    expect(job).not.toHaveBeenCalled()
  })
})
