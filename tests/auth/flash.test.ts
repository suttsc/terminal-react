import { describe, expect, it, vi } from 'vitest'
import { openFlash, sealFlash } from '@/auth/flash'

describe('the sign-in flash', () => {
  it('opens what it sealed', async () => {
    const rejection = { rejection: { name: 'Some Person', email: 'someone@example.com' } }

    await expect(openFlash(await sealFlash(rejection))).resolves.toEqual(rejection)
    await expect(openFlash(await sealFlash({ signedIn: true }))).resolves.toEqual({
      signedIn: true,
    })
  })

  it('keeps the details unreadable in transit', async () => {
    const sealed = await sealFlash({
      rejection: { name: 'Some Person', email: 'someone@example.com' },
    })

    expect(sealed).not.toContain('someone')
    expect(Buffer.from(sealed.split('.')[3] ?? '', 'base64url').toString()).not.toContain('someone')
  })

  it('ignores anything forged, tampered with or missing', async () => {
    const sealed = await sealFlash({ signedIn: true })

    // Change one character in the middle of the ciphertext, which always changes real bits
    // (a token's last base64url character carries padding the decoder ignores).
    const parts = sealed.split('.')
    const ciphertext = parts[3] ?? ''
    const middle = Math.floor(ciphertext.length / 2)
    parts[3] = `${ciphertext.slice(0, middle)}${ciphertext[middle] === 'A' ? 'B' : 'A'}${ciphertext.slice(middle + 1)}`

    await expect(openFlash(parts.join('.'))).resolves.toBeNull()
    await expect(openFlash('{"signedIn":true}')).resolves.toBeNull()
    await expect(openFlash(null)).resolves.toBeNull()
  })

  it('ignores a flash sealed with another secret', async () => {
    const sealed = await sealFlash({ signedIn: true })
    vi.stubEnv('AUTH_SECRET', 'a-different-secret-entirely-0123456789')

    await expect(openFlash(sealed)).resolves.toBeNull()
  })

  it('expires after a minute', async () => {
    vi.useFakeTimers({ now: new Date('2026-10-20T12:00:00Z') })
    const sealed = await sealFlash({ signedIn: true })
    vi.setSystemTime(new Date('2026-10-20T12:01:01Z'))

    await expect(openFlash(sealed)).resolves.toBeNull()
    vi.useRealTimers()
  })
})
