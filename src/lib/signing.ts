import { createHmac, timingSafeEqual } from 'node:crypto'
import { derivedKey } from '@/lib/secrets'

const mac = (value: string) =>
  createHmac('sha256', derivedKey('signed-cookie')).update(value).digest('base64url')

/** `value.signature`, so the browser can read it but not change it. */
export const sign = (value: string): string => `${value}.${mac(value)}`

/** The signed value, or undefined if it is missing or has been tampered with. */
export function unsign(signed: string | undefined): string | undefined {
  if (signed === undefined) {
    return undefined
  }

  const dot = signed.lastIndexOf('.')

  if (dot < 0) {
    return undefined
  }

  const value = signed.slice(0, dot)
  const given = Buffer.from(signed.slice(dot + 1))
  const expected = Buffer.from(mac(value))

  return given.length === expected.length && timingSafeEqual(given, expected) ? value : undefined
}
