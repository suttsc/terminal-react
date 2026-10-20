import type { StravaClient } from '@/integrations/strava/strava-client'
import type { RunsRepository, StatsRepository } from '@/repositories/types'

/**
 * Mirrors the last fortnight of Strava into the local collection.
 */
export async function syncStrava(deps: {
  strava: StravaClient
  runs: RunsRepository
  stats: StatsRepository
  now: Date
}): Promise<number> {
  const activities = await deps.strava.activitiesSince(
    new Date(deps.now.getTime() - 14 * 86_400_000),
  )

  await deps.runs.upsert(activities)
  await deps.stats.markStravaSynced(deps.now)

  return activities.length
}
