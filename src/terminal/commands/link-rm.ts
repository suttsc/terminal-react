import { linkHeading } from '@/services/link-view'
import { inline } from '@/terminal/output'
import { defineOwnerCommand } from '@/terminal/types'

export default defineOwnerCommand({
  signature: '/link rm',
  description: 'Take a link off the shelf, by id',
  outcome: 'inline',
  handle: async (ctx) => {
    const id = ctx.arg(0) ?? ''
    const link = /^\d+$/.test(id) ? await ctx.repos.links.find(Number(id)) : null

    if (link === null) {
      return inline(['Usage: /link rm <id>. No link by that id.'])
    }

    await ctx.repos.links.delete(link.id)

    return inline([`Removed: ${linkHeading(link)}`])
  },
})
