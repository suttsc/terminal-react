import { describe, expect, it } from 'vitest'
import { FakeStravaClient } from '@/integrations/strava/fake-strava-client'
import { InMemoryRuns, InMemoryStats } from '@/repositories/memory'
import { syncStrava } from '@/services/sync-strava'
import { activity } from '../support/make-test-context'

const now = new Date('2026-10-10T12:00:00Z')

describe('syncing Strava', () => {
  it('mirrors the last fortnight into the local collection and notes when', async () => {
    const runs = new InMemoryRuns()
    const stats = new InMemoryStats()
    const strava = new FakeStravaClient([
      activity({ stravaId: 1, name: 'Morning', startedAt: new Date('2026-10-09T07:00:00Z') }),
      activity({ stravaId: 2, name: 'Ancient', startedAt: new Date('2026-09-01T07:00:00Z') }),
    ])

    await expect(syncStrava({ strava, runs, stats, now })).resolves.toBe(1)
    expect(runs.activities.map((run) => run.name)).toEqual(['Morning'])
    expect(stats.snapshot.stravaSyncedAt).toEqual(now)
  })

  it('updates an activity it has already mirrored instead of duplicating it', async () => {
    const runs = new InMemoryRuns([activity({ stravaId: 1, name: 'Before' })])
    const strava = new FakeStravaClient([
      activity({ stravaId: 1, name: 'Renamed', distanceMetres: 6000 }),
    ])

    await syncStrava({ strava, runs, stats: new InMemoryStats(), now })

    expect(runs.activities).toHaveLength(1)
    expect(runs.activities[0]).toMatchObject({ name: 'Renamed', distanceMetres: 6000 })
  })
})
