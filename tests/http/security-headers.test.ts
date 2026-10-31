import { describe, expect, it } from 'vitest'
import nextConfig from '../../next.config'
import { contentSecurityPolicy, createNonce, staticSecurityHeaders } from '@/http/security-headers'

const directives = (policy: string) =>
  Object.fromEntries(
    policy.split('; ').map((directive) => {
      const [name, ...values] = directive.split(' ')

      return [name, values.join(' ')]
    }),
  )

describe('the Content-Security-Policy', () => {
  it('allows scripts only with the nonce, and never from elsewhere', () => {
    const policy = directives(contentSecurityPolicy('abc123'))

    expect(policy['script-src']).toBe("'self' 'nonce-abc123' 'strict-dynamic'")
    expect(policy['default-src']).toBe("'self'")
    expect(policy['object-src']).toBe("'none'")
    expect(policy['frame-ancestors']).toBe("'none'")
    expect(policy['base-uri']).toBe("'self'")
    expect(policy['form-action']).toBe("'self'")
  })

  it('never allows eval or inline scripts in production', () => {
    const policy = contentSecurityPolicy('abc123')

    expect(policy).not.toContain('unsafe-eval')
    expect(directives(policy)['script-src']).not.toContain('unsafe-inline')
    expect(policy).toContain('upgrade-insecure-requests')
  })

  it('allows eval in development only, for React', () => {
    expect(directives(contentSecurityPolicy('abc', { dev: true }))['script-src']).toContain(
      "'unsafe-eval'",
    )
  })

  it('gets a different nonce every time', () => {
    const nonces = new Set(Array.from({ length: 50 }, createNonce))

    expect(nonces.size).toBe(50)
    expect(createNonce().length).toBeGreaterThanOrEqual(32)
  })
})

describe('the fixed security headers', () => {
  it('are sent on every path', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const everywhere = rules.find((rule) => rule.source === '/:path*')

    expect(everywhere?.headers).toEqual([...staticSecurityHeaders])
    expect(Object.fromEntries(staticSecurityHeaders.map((h) => [h.key, h.value]))).toMatchObject({
      'Strict-Transport-Security': 'max-age=63072000',
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    })
  })
})
