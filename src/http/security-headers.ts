/**
 * Headers that are the same on every response. The Content-Security-Policy
 * needs a fresh nonce per request, so proxy.ts adds that one.
 */
export const staticSecurityHeaders = [
  // Two years. Subdomains are left out until every one of them serves HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=63072000' },
  // Nobody frames the site; the CSP's frame-ancestors says the same to newer browsers.
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()',
  },
] as const

/** A fresh, unguessable value for one response. */
export const createNonce = (): string => btoa(crypto.randomUUID())

/**
 * A strict policy: scripts only with this response's nonce (and whatever those
 * load), nothing from other origins, never framed. React's inline `style`
 * attributes are allowed; they can't run code.
 */
export function contentSecurityPolicy(nonce: string, { dev = false } = {}): string {
  return [
    "default-src 'self'",
    // React needs eval in development for its error overlays; never in production.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ''}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ['upgrade-insecure-requests']),
  ].join('; ')
}
