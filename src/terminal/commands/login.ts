import { inline, navigate } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/login',
  description: 'Prove it',
  outcome: 'navigate',
  hidden: true,
  handle: async (ctx) =>
    ctx.isOwner ? inline(['Already signed in. Still suttsc.']) : navigate('authGoogle'),
})
