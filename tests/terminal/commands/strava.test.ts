import { describe, expect, it } from 'vitest'
import { activity, makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/strava', () => {
  it('shows the last seven days of runs from the local mirror', async () => {
    const { ctx } = makeTestContext({
      now: new Date('2026-10-10T12:00:00Z'),
      stats: { stravaSyncedAt: new Date('2026-10-10T11:20:00Z') },
      runs: [
        activity({
          stravaId: 1,
          name: 'Easy one',
          distanceMetres: 8200,
          movingSeconds: 2558,
          elevationMetres: 64,
          startedAt: new Date('2026-10-05T07:00:00Z'),
        }),
        activity({
          stravaId: 2,
          distanceMetres: 5000,
          startedAt: new Date('2026-10-08T07:00:00Z'),
        }),
        activity({ stravaId: 3, startedAt: new Date('2026-10-01T07:00:00Z') }),
        activity({ stravaId: 4, sportType: 'Ride', startedAt: new Date('2026-10-09T07:00:00Z') }),
      ],
    })

    const output = await run('/strava', ctx)

    expect(output).toMatchObject({ type: 'window', title: 'strava.csv', component: 'strava' })
    expect(output.type === 'window' && output.props).toEqual({
      runs: [
        { day: 'Mon', name: 'Easy one', distance: '8.2 km', pace: '5:12/km', elevation: '64m' },
        { day: 'Thu', name: 'Morning', distance: '5.0 km', pace: '5:00/km', elevation: '20m' },
      ],
      total: '13.2 km',
      syncedAgo: '40 minutes ago',
    })
  })

  it('copes with never having synced', async () => {
    const output = await run('/strava', makeTestContext().ctx)

    expect(output.type === 'window' && output.props).toEqual({
      runs: [],
      total: '0.0 km',
      syncedAgo: null,
    })
  })

  it('gives a run that went nowhere no pace', async () => {
    const { ctx } = makeTestContext({
      now: new Date('2026-10-10T12:00:00Z'),
      runs: [activity({ distanceMetres: 0, startedAt: new Date('2026-10-09T07:00:00Z') })],
    })
    const output = await run('/strava', ctx)

    expect(output).toMatchObject({ props: { runs: [{ pace: '—' }] } })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/strava')
  })
})
