import type { CollectionConfig } from 'payload'
import { nobody, ownerOnly } from '@/collections/access'

/**
 * A local mirror of the owner's Strava activities. Only the cron writes here;
 * requests read this, never Strava.
 */
export const StravaActivities: CollectionConfig = {
  slug: 'strava-activities',
  labels: { singular: 'Strava activity', plural: 'Strava activities' },
  access: { read: ownerOnly, create: nobody, update: nobody, delete: nobody },
  defaultSort: '-startedAt',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'sportType', 'distanceMetres', 'startedAt'],
    description: 'Mirrored from Strava once a day. Read-only.',
  },
  timestamps: true,
  fields: [
    { name: 'stravaId', type: 'number', required: true, unique: true, index: true },
    { name: 'name', type: 'text', required: true },
    { name: 'sportType', type: 'text', required: true },
    { name: 'distanceMetres', type: 'number', required: true, min: 0 },
    { name: 'movingSeconds', type: 'number', required: true, min: 0 },
    { name: 'elevationMetres', type: 'number', required: true, min: 0 },
    { name: 'startedAt', type: 'date', required: true, index: true },
  ],
}
