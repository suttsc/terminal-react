import type { CollectionConfig } from 'payload'
import { nobody, ownerOnly } from '@/collections/access'
import { ownerStrategy } from '@/auth/payload-strategy'

/**
 * Exactly one row, seeded by a migration. Signing in happens through Google;
 * there is no password to have.
 */
export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email', hidden: true },
  access: { read: ownerOnly, create: nobody, update: ownerOnly, delete: nobody },
  auth: {
    disableLocalStrategy: true,
    strategies: [ownerStrategy],
  },
  fields: [{ name: 'email', type: 'email', required: true, unique: true }],
}
