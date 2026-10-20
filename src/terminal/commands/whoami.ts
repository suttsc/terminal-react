import { window } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

/**
 * The window reads the browser and timezone itself, at render time. Nothing
 * about the visitor reaches the server, let alone stays there.
 */
export default defineCommand({
  signature: '/whoami',
  description: 'Identify the current user',
  outcome: 'window',
  handle: async () => window('whoami.txt', 'whoami'),
})
