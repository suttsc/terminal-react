import type { CollectionConfig } from 'payload'
import { ownerOnly } from '@/collections/access'

/**
 * Desktop icons on /tools that are plain links rather than windows.
 */
export const ToolLinks: CollectionConfig = {
  slug: 'tool-links',
  labels: { singular: 'Tool link', plural: 'Tool links' },
  access: { read: ownerOnly, create: ownerOnly, update: ownerOnly, delete: ownerOnly },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'glyph', 'url'],
    description: 'Plain links on the /tools desktop, beside the window tools.',
  },
  fields: [
    { name: 'label', type: 'text', required: true },
    { name: 'description', type: 'text', required: true },
    {
      name: 'glyph',
      type: 'text',
      required: true,
      maxLength: 4,
      admin: { description: 'A few characters drawn on the icon.' },
    },
    { name: 'url', type: 'text', required: true },
  ],
}
