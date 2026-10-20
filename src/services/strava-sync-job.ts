import { HttpStravaClient } from '@/integrations/strava/http-strava-client'
import { getPayloadClient, payloadRepositories } from '@/repositories/payload'
import { syncStrava } from '@/services/sync-strava'

/**
 * Production wiring for the daily Strava pull. The rotated refresh token lives
 * in the integrations global, seeded from STRAVA_REFRESH_TOKEN until then.
 */
export async function runStravaSync(): Promise<Record<string, unknown>> {
  const { STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_REFRESH_TOKEN } = process.env

  if (!STRAVA_CLIENT_ID || !STRAVA_CLIENT_SECRET) {
    return { skipped: 'Strava is not configured.' }
  }

  const payload = await getPayloadClient()
  const { runs, stats } = await payloadRepositories()
  const strava = new HttpStravaClient({
    clientId: STRAVA_CLIENT_ID,
    clientSecret: STRAVA_CLIENT_SECRET,
    seedRefreshToken: STRAVA_REFRESH_TOKEN || null,
    tokens: {
      get: async () =>
        (await payload.findGlobal({ slug: 'integrations' })).stravaRefreshToken || null,
      set: async (token) => {
        await payload.updateGlobal({ slug: 'integrations', data: { stravaRefreshToken: token } })
      },
    },
  })

  return { synced: await syncStrava({ strava, runs, stats, now: new Date() }) }
}
