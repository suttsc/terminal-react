import type { GlobalConfig } from 'payload'
import { nobody, ownerOnly } from '@/collections/access'

/**
 * The only numbers the site keeps. niceTryCount is a bare count, nothing more.
 */
export const SiteStats: GlobalConfig = {
  slug: 'site-stats',
  label: 'Site stats',
  access: { read: ownerOnly, update: nobody },
  admin: { description: 'Read-only. Counted by the site itself.' },
  fields: [
    { name: 'deployCount', type: 'number', required: true, defaultValue: 0 },
    { name: 'niceTryCount', type: 'number', required: true, defaultValue: 0 },
    { name: 'stravaSyncedAt', type: 'date' },
  ],
}
