import { timingSafeEqual } from 'node:crypto'
import { unauthorised } from '@/http/responses'

/**
 * Vercel sends `Authorization: Bearer $CRON_SECRET` to cron routes. Anything
 * else, including a missing secret, is turned away.
 */
export function isCronRequest(request: Request, secret = process.env.CRON_SECRET): boolean {
  if (!secret) {
    return false
  }

  const given = Buffer.from(request.headers.get('authorization') ?? '')
  const expected = Buffer.from(`Bearer ${secret}`)

  return given.length === expected.length && timingSafeEqual(given, expected)
}

export function cronRoute(job: () => Promise<Record<string, unknown>>) {
  return async function GET(request: Request): Promise<Response> {
    if (!isCronRequest(request)) {
      return unauthorised()
    }

    return Response.json(await job())
  }
}
