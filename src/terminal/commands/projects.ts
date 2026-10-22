import { navigate } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/projects',
  description: 'Things I built on purpose',
  outcome: 'navigate',
  pure: true,
  handle: async () => navigate('projects'),
})
