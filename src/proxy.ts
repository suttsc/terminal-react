import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { FLASH_COOKIE, FLASH_HEADER } from '@/auth/flash'

/**
 * Server components can't delete cookies, so the sign-in flash is handed to the
 * root layout in a request header and dropped from the browser here, in one go.
 */
export function proxy(request: NextRequest) {
  // A cancelled consent screen comes back as /?error=…: go home, quietly.
  if (request.nextUrl.searchParams.has('error')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const headers = new Headers(request.headers)
  const flash = request.cookies.get(FLASH_COOKIE)?.value

  // Whatever the browser sent in this header is ignored; only the cookie counts.
  headers.delete(FLASH_HEADER)

  if (flash) {
    headers.set(FLASH_HEADER, flash)
  }

  const response = NextResponse.next({ request: { headers } })

  if (flash) {
    response.cookies.delete(FLASH_COOKIE)
  }

  return response
}

export const config = { matcher: '/' }
