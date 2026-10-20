import { describe, expect, it, vi } from 'vitest'
import type { Flash } from '@/auth/flash'
import { decideSignIn } from '@/auth/sign-in'
import type { GoogleProfile } from '@/auth/sign-in'
import { InMemoryStats } from '@/repositories/memory'

function signIn(profile: GoogleProfile | undefined) {
  const stats = new InMemoryStats()
  const flashes: Flash[] = []

  return decideSignIn(profile, { stats, flash: async (flash) => void flashes.push(flash) }).then(
    (result) => ({ result, stats: stats.snapshot, flashes }),
  )
}

const google = (email: string, verified = true): GoogleProfile => ({
  name: 'Some Person',
  email,
  email_verified: verified,
})

describe('the Google sign-in callback', () => {
  it.each(['suttsc@example.com', ' Suttsc@Example.com '])(
    'signs the owner in as %j',
    async (email) => {
      const { result, stats, flashes } = await signIn(google(email))

      expect(result).toBe(true)
      expect(stats.niceTryCount).toBe(0)
      expect(flashes).toEqual([{ signedIn: true }])
    },
  )

  it.each(['someone@example.com', 'suttsc2@example.com', 'suttsc@example.com.evil.test'])(
    'turns %j away, counts it, and shows them their own details once',
    async (email) => {
      const { result, stats, flashes } = await signIn(google(email))

      expect(result).toBe('/')
      expect(stats.niceTryCount).toBe(1)
      expect(flashes).toEqual([{ rejection: { name: 'Some Person', email } }])
    },
  )

  it('refuses an unverified Google address even when it matches', async () => {
    const { result, stats } = await signIn(google('suttsc@example.com', false))

    expect(result).toBe('/')
    expect(stats.niceTryCount).toBe(1)
  })

  it('refuses everyone when no owner is configured', async () => {
    vi.stubEnv('OWNER_EMAIL', '')

    const { result } = await signIn(google('suttsc@example.com'))

    expect(result).toBe('/')
  })

  it('copes with a profile that says nothing', async () => {
    const { result, flashes } = await signIn(undefined)

    expect(result).toBe('/')
    expect(flashes).toEqual([{ rejection: { name: null, email: null } }])
  })
})
