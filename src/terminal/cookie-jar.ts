import 'server-only'
import { cookies } from 'next/headers'
import { secureCookies } from '@/lib/secrets'
import { sign, unsign } from '@/lib/signing'
import type { CookieJar } from '@/terminal/types'

/**
 * The request's cookies, through next/headers. Only route handlers may write.
 */
export async function requestCookieJar(): Promise<CookieJar> {
  const store = await cookies()
  const base = { path: '/', sameSite: 'lax', secure: secureCookies() } as const

  return {
    get: (name) => store.get(name)?.value,
    set: (name, value, { maxAge } = {}) => store.set(name, value, { ...base, maxAge }),
    getSigned: (name) => unsign(store.get(name)?.value),
    // No maxAge: a session cookie, gone when the browser is.
    setSigned: (name, value) => store.set(name, sign(value), { ...base, httpOnly: true }),
  }
}
