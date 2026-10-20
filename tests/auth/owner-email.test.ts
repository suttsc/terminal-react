import { describe, expect, it, vi } from 'vitest'
import { isOwnerEmail } from '@/auth/owner-email'

describe('isOwnerEmail', () => {
  it.each(['suttsc@example.com', ' Suttsc@Example.com '])('lets %j in', (email) => {
    expect(isOwnerEmail(email)).toBe(true)
  })

  it.each([
    'someone@example.com',
    'suttsc2@example.com',
    'suttsc@example.com.evil.test',
    'example.com',
    '',
  ])('turns %j away', (email) => {
    expect(isOwnerEmail(email)).toBe(false)
  })

  it('turns away a missing address', () => {
    expect(isOwnerEmail(null)).toBe(false)
    expect(isOwnerEmail(undefined)).toBe(false)
  })

  it.each(['', undefined])('turns everyone away when OWNER_EMAIL is %j', (owner) => {
    vi.stubEnv('OWNER_EMAIL', owner)

    expect(isOwnerEmail('suttsc@example.com')).toBe(false)
    expect(isOwnerEmail('')).toBe(false)
  })
})
