import type { CollectionConfig } from 'payload'
import { ownerOnly } from '@/collections/access'

export const Projects: CollectionConfig = {
  slug: 'projects',
  access: { read: ownerOnly, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  defaultSort: 'order',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'stack', 'order'],
    description: 'What /projects lists, in order.',
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'summary', type: 'textarea', required: true },
    {
      name: 'stack',
      type: 'text',
      required: true,
      admin: { description: 'e.g. "next.js · payload · react · 2026"' },
    },
    { name: 'url', type: 'text' },
    { name: 'order', type: 'number', required: true, defaultValue: 0 },
  ],
}
