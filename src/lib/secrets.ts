import { createHash } from 'node:crypto'

/**
 * The Auth.js secret, which also seals the flash cookie and signs the sudo count.
 */
export function authSecret(): string {
  const secret = process.env.AUTH_SECRET

  if (!secret) {
    throw new Error('AUTH_SECRET is not set.')
  }

  return secret
}

/** A 32-byte key derived from the Auth.js secret for one named purpose. */
export const derivedKey = (purpose: string): Uint8Array =>
  new Uint8Array(createHash('sha256').update(`${purpose}:${authSecret()}`).digest())

export const secureCookies = (): boolean => process.env.NODE_ENV === 'production'
