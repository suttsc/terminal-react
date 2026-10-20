import { inline } from '@/terminal/output'
import { defineOwnerCommand } from '@/terminal/types'

export default defineOwnerCommand({
  signature: '/logout',
  description: 'Go back to being everyone',
  outcome: 'inline',
  handle: async (ctx) => {
    await ctx.session.signOut()

    return inline(['Signed out. You are suttsc again, unofficially.'])
  },
})
