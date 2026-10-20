import { getToken } from 'next-auth/jwt'

/**
 * Whether these headers carry the owner's Auth.js session cookie. Read
 * without next/headers, so Payload can call it from its auth strategy.
 */
export async function hasOwnerSession(headers: Headers): Promise<boolean> {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    return false
  }

  for (const secureCookie of [true, false]) {
    try {
      const token = await getToken({ req: { headers }, secret, secureCookie })

      if (token !== null) {
        return token.owner === true
      }
    } catch {
      return false
    }
  }

  return false
}
