import { navigate } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/hire',
  description: 'Availability and how to get in touch',
  outcome: 'navigate',
  handle: async () => navigate('hire'),
})
