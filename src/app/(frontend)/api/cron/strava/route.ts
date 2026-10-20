import { cronRoute } from '@/http/cron'
import { runStravaSync } from '@/services/strava-sync-job'

export const maxDuration = 300

export const GET = cronRoute(runStravaSync)
