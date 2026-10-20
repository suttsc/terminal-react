/**
 * Stands in for a CSRF token: a state-changing request must come from a page
 * on this site. Browsers always send Origin on a cross-origin POST.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')

  if (origin === null) {
    return false
  }

  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host')

  try {
    return host !== null && new URL(origin).host === host
  } catch {
    return false
  }
}
