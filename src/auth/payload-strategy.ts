import type { AuthStrategy } from 'payload'
import { hasOwnerSession } from '@/auth/owner-session'

/**
 * Lets the owner into the Payload admin on the strength of their Auth.js
 * session. There is no password and no second account.
 */
export const ownerStrategy: AuthStrategy = {
  name: 'owner-google',
  authenticate: async ({ headers, payload }) => {
    const email = process.env.OWNER_EMAIL?.trim().toLowerCase()

    if (!email || !(await hasOwnerSession(headers))) {
      return { user: null }
    }

    const { docs } = await payload.find({
      collection: 'users',
      where: { email: { equals: email } },
      limit: 1,
      depth: 0,
    })

    return { user: docs[0] ? { ...docs[0], collection: 'users' } : null }
  },
}
