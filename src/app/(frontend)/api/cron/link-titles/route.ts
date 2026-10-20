import { cronRoute } from '@/http/cron'
import { payloadRepositories } from '@/repositories/payload'
import { retryLinkTitles } from '@/services/link-titles-job'

export const maxDuration = 300

export const GET = cronRoute(async () => retryLinkTitles((await payloadRepositories()).links))
