import { window } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/ai',
  description: 'Who else worked on this',
  outcome: 'window',
  page: true,
  pure: true,
  handle: async () => window('ai.txt', 'ai'),
})
