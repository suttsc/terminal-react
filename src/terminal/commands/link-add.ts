import { linkCategories } from '@/lib/link-categories'
import { window } from '@/terminal/output'
import { defineOwnerCommand } from '@/terminal/types'

export default defineOwnerCommand({
  signature: '/link add',
  description: 'Put a link on the shelf',
  outcome: 'window',
  handle: async () => window('new-link.url', 'link-add', { categories: [...linkCategories] }),
})
