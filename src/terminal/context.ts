import 'server-only'
import { getIsOwner, signOut } from '@/auth/auth'
import { lazyPayloadRepositories } from '@/repositories/payload'
import { requestCookieJar } from '@/terminal/cookie-jar'
import type { RunContext } from '@/terminal/registry'

/**
 * The production context for one request. Built fresh every time.
 */
export async function requestContext(): Promise<RunContext> {
  const [isOwner, cookies] = await Promise.all([getIsOwner(), requestCookieJar()])

  return {
    isOwner,
    cookies,
    repos: lazyPayloadRepositories(),
    session: {
      signOut: async () => {
        await signOut({ redirect: false })
      },
    },
    now: () => new Date(),
  }
}
