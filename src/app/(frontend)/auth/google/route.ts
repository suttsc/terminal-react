import { signIn } from '@/auth/auth'

/**
 * Hand the visitor to Google. Auth.js sets the state and PKCE cookies; the
 * callback comes back to /api/auth/callback/google.
 */
export async function GET(request: Request): Promise<Response> {
  const next = new URL(request.url).searchParams.get('next')

  // Only two places to land: home, or the admin. Never an arbitrary URL.
  await signIn('google', { redirectTo: next === '/admin' ? '/admin' : '/' })

  return new Response(null, { status: 204 })
}
