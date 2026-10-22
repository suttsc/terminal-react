import { navigate } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/tools',
  description: 'Small utilities. Nothing leaves the browser',
  outcome: 'navigate',
  pure: true,
  handle: async () => navigate('tools'),
})
