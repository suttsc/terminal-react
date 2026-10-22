import { describe, expect, it } from 'vitest'
import { decode, encode } from '@/lib/tools/base64'
import { decodeJwt } from '@/lib/tools/jwt'
import { formatIn, parseMoment } from '@/lib/tools/timestamp'

describe('base64', () => {
  it('round-trips text beyond Latin-1', () => {
    const text = 'naïve café — 漢字 🙂'

    expect(decode(encode(text, false))).toEqual({ ok: true, value: text })
    expect(decode(encode(text, true))).toEqual({ ok: true, value: text })
  })

  it('makes url-safe output without padding', () => {
    expect(encode('??>', false)).toBe('Pz8+')
    expect(encode('?', true)).toBe('Pw')
  })

  it('accepts whitespace and missing padding', () => {
    expect(decode(' aGVs\nbG8 ')).toEqual({ ok: true, value: 'hello' })
  })

  it('refuses what is not base64, or not text once decoded', () => {
    expect(decode('!!!')).toMatchObject({ ok: false })
    expect(decode('/w==')).toMatchObject({ ok: false })
  })
})

describe('jwt', () => {
  const segment = (value: object) => Buffer.from(JSON.stringify(value)).toString('base64url')
  const token = `${segment({ alg: 'HS256' })}.${segment({ sub: 'suttsc', exp: 1_800_000_000 })}.sig`

  it('reads the header, payload and expiry without checking the signature', () => {
    const decoded = decodeJwt(token)

    expect(decoded).toMatchObject({ ok: true, expiresAt: new Date(1_800_000_000_000) })
    expect(decoded.ok && JSON.parse(decoded.payload)).toEqual({ sub: 'suttsc', exp: 1_800_000_000 })
  })

  it('refuses a token without three parts, or with parts that are not JSON', () => {
    expect(decodeJwt('a.b')).toEqual({ ok: false, error: 'A JWT has three parts. This has not.' })
    expect(decodeJwt('a.b.c')).toEqual({ ok: false, error: 'The header or payload is not JSON.' })
  })
})

describe('timestamp', () => {
  it('reads seconds, milliseconds and dates', () => {
    expect(parseMoment('1800000000')?.toISOString()).toBe('2027-01-15T08:00:00.000Z')
    expect(parseMoment('1800000000000')?.toISOString()).toBe('2027-01-15T08:00:00.000Z')
    expect(parseMoment('2026-10-20T12:00:00Z')?.toISOString()).toBe('2026-10-20T12:00:00.000Z')
  })

  it('has nothing for blanks or nonsense', () => {
    expect(parseMoment('   ')).toBeNull()
    expect(parseMoment('next tuesdayish')).toBeNull()
  })

  it('formats a moment in a given zone', () => {
    expect(formatIn(new Date('2026-07-01T12:00:00Z'), 'Europe/London')).toContain('13:00:00')
  })
})
