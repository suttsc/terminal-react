import type { RunsRepository, StatsRepository, StravaActivityData } from '@/repositories/types'
import { timeAgo } from '@/services/relative-time'

export type RunView = {
  day: string
  name: string
  distance: string
  pace: string
  elevation: string
}

export type RunningLogView = {
  runs: RunView[]
  total: string
  syncedAgo: string | null
}

const kilometreFormat = new Intl.NumberFormat('en-GB', {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
})

const kilometres = (metres: number): string => `${kilometreFormat.format(metres / 1000)} km`

/**
 * Seconds per kilometre, or null for a run that went nowhere.
 */
function paceSeconds(run: StravaActivityData): number | null {
  return run.distanceMetres === 0
    ? null
    : Math.round(run.movingSeconds / (run.distanceMetres / 1000))
}

function pace(secondsPerKilometre: number | null): string {
  if (secondsPerKilometre === null) {
    return '—'
  }

  const minutes = Math.floor(secondsPerKilometre / 60)
  const seconds = String(secondsPerKilometre % 60).padStart(2, '0')

  return `${minutes}:${seconds}/km`
}

/**
 * Shapes the mirrored Strava runs for display. Reads the local tables only.
 */
export async function lastSevenDays({
  runs,
  stats,
  now,
  timezone,
}: {
  runs: RunsRepository
  stats: StatsRepository
  now: Date
  timezone: string
}): Promise<RunningLogView> {
  const since = new Date(now.getTime() - 7 * 86_400_000)
  const [recent, snapshot] = await Promise.all([runs.runsSince(since), stats.read()])
  const weekday = new Intl.DateTimeFormat('en-GB', { timeZone: timezone, weekday: 'short' })

  return {
    runs: recent.map((run) => ({
      day: weekday.format(run.startedAt),
      name: run.name,
      distance: kilometres(run.distanceMetres),
      pace: pace(paceSeconds(run)),
      elevation: `${run.elevationMetres}m`,
    })),
    total: kilometres(recent.reduce((sum, run) => sum + run.distanceMetres, 0)),
    syncedAgo: snapshot.stravaSyncedAt ? timeAgo(snapshot.stravaSyncedAt, now) : null,
  }
}
