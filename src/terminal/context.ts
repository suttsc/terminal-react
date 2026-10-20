import 'server-only'
import { getIsOwner, signOut } from '@/auth/auth'
import { payloadRepositories } from '@/repositories/payload'
import { requestCookieJar } from '@/terminal/cookie-jar'
import type { RunContext } from '@/terminal/registry'

/**
 * The production context for one request. Built fresh every time.
 */
export async function requestContext(): Promise<RunContext> {
  const [isOwner, cookies, repos] = await Promise.all([
    getIsOwner(),
    requestCookieJar(),
    payloadRepositories(),
  ])

  return {
    isOwner,
    cookies,
    repos,
    session: {
      signOut: async () => {
        await signOut({ redirect: false })
      },
    },
    now: () => new Date(),
  }
}
