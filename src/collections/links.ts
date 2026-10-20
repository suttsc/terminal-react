import type { CollectionConfig } from 'payload'
import { after } from 'next/server'
import { linkCategories } from '@/lib/link-categories'
import { ownerOnly } from '@/collections/access'

export const TITLE_FETCH_SCHEDULED = 'titleFetchScheduled'

export const Links: CollectionConfig = {
  slug: 'links',
  labels: { singular: 'Link', plural: 'Links' },
  access: { read: ownerOnly, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  defaultSort: '-createdAt',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'category', 'createdAt'],
    description: 'Things other people wrote that are still being thought about.',
  },
  timestamps: true,
  fields: [
    {
      name: 'url',
      type: 'text',
      required: true,
      maxLength: 2048,
      validate: (value: string | null | undefined) => {
        try {
          const { protocol } = new URL(value ?? '')

          return protocol === 'http:' || protocol === 'https:' || 'Only http and https links.'
        } catch {
          return 'Not a URL.'
        }
      },
    },
    {
      name: 'title',
      type: 'text',
      maxLength: 255,
      admin: { description: 'Left empty, it is fetched from the page after saving.' },
    },
    { name: 'author', type: 'text', maxLength: 255 },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'other',
      options: linkCategories.map((value) => ({ label: value, value })),
    },
    { name: 'reason', type: 'textarea', required: true, maxLength: 1000 },
  ],
  hooks: {
    afterChange: [
      ({ doc, operation, context }) => {
        if (operation !== 'create' || doc.title || context[TITLE_FETCH_SCHEDULED]) {
          return doc
        }

        try {
          after(async () => {
            const { fetchTitleNow } = await import('@/services/fetch-title-now')
            await fetchTitleNow(doc.id)
          })
        } catch {
          // Not inside a request (a script, say): the daily cron will find it.
        }

        return doc
      },
    ],
  },
}
