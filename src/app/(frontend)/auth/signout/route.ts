import { NextResponse } from 'next/server'
import { signOut } from '@/auth/auth'
import { forbidden } from '@/http/responses'
import { isSameOrigin } from '@/http/same-origin'

/**
 * The admin's log out button. The palette has /logout for the same job.
 */
export async function POST(request: Request): Promise<Response> {
  if (!isSameOrigin(request)) {
    return forbidden()
  }

  await signOut({ redirect: false })

  return NextResponse.redirect(new URL('/', request.url), 303)
}
