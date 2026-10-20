import type { GlobalConfig } from 'payload'
import { nobody } from '@/collections/access'

/**
 * Strava rotates its refresh token on every use, so the latest one lives here.
 * Only the cron route reads or writes it, through the Local API.
 */
export const Integrations: GlobalConfig = {
  slug: 'integrations',
  access: { read: nobody, update: nobody, readVersions: nobody },
  admin: { hidden: true },
  fields: [{ name: 'stravaRefreshToken', type: 'text' }],
}
