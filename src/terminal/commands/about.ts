import { window } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/about',
  description: 'Who is running this',
  outcome: 'window',
  pure: true,
  handle: async () => window('about.txt', 'about'),
})
