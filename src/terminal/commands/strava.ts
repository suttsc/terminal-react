import { site } from '@/site.config'
import { lastSevenDays } from '@/services/running-log'
import { window } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/strava',
  description: 'Recent runs, whether you asked or not',
  outcome: 'window',
  handle: async (ctx) =>
    window(
      'strava.csv',
      'strava',
      await lastSevenDays({
        runs: ctx.repos.runs,
        stats: ctx.repos.stats,
        now: ctx.now(),
        timezone: site.timezone,
      }),
    ),
})
