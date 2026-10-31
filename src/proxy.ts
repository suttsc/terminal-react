import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { FLASH_COOKIE, FLASH_HEADER } from '@/auth/flash'
import { contentSecurityPolicy, createNonce } from '@/http/security-headers'

/**
 * Runs before every page. It gives each response a Content-Security-Policy with
 * a fresh nonce, which Next reads from the request and puts on its own scripts.
 *
 * On the homepage it also hands over the sign-in flash: server components can't
 * delete cookies, so the flash goes to the root layout in a request header and
 * is dropped from the browser here, in one go.
 */
export function proxy(request: NextRequest) {
  const isHome = request.nextUrl.pathname === '/'

  // A cancelled consent screen comes back as /?error=…: go home, quietly.
  if (isHome && request.nextUrl.searchParams.has('error')) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  const policy = contentSecurityPolicy(createNonce(), {
    dev: process.env.NODE_ENV === 'development',
  })
  const headers = new Headers(request.headers)
  const flash = isHome ? request.cookies.get(FLASH_COOKIE)?.value : undefined

  headers.set('Content-Security-Policy', policy)
  // Whatever the browser sent in this header is ignored; only the cookie counts.
  headers.delete(FLASH_HEADER)

  if (flash) {
    headers.set(FLASH_HEADER, flash)
  }

  const response = NextResponse.next({ request: { headers } })

  response.headers.set('Content-Security-Policy', policy)

  if (flash) {
    response.cookies.delete(FLASH_COOKIE)
  }

  return response
}

export const config = {
  matcher: [
    {
      // Pages only: not route handlers, the Payload admin and API, or static files.
      source:
        '/((?!api|payload-api|admin|terminal|auth|_next|favicon|apple-touch-icon|robots\\.txt).*)',
      // Prefetches don't render a document, so they need no policy.
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' },
      ],
    },
  ],
}
