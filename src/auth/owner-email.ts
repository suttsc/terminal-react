import { timingSafeEqual } from 'node:crypto'

const normalise = (email: string) => email.trim().toLowerCase()

/**
 * Whether the address is the owner's. Exact match only: never a domain check,
 * never a substring.
 */
export function isOwnerEmail(email: string | null | undefined): boolean {
  const owner = process.env.OWNER_EMAIL

  if (!owner || !email) {
    return false
  }

  const a = Buffer.from(normalise(owner))
  const b = Buffer.from(normalise(email))

  return a.length === b.length && timingSafeEqual(a, b)
}
