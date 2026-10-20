import { toLinkView } from '@/services/link-view'
import { inline, window } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

/**
 * Opens one saved link. Reached from the /links menu rather than typed.
 */
export default defineCommand({
  signature: '/link',
  description: 'Open a saved link',
  outcome: 'window',
  hidden: true,
  handle: async (ctx) => {
    const id = ctx.arg(0) ?? ''
    const link = /^\d+$/.test(id) ? await ctx.repos.links.find(Number(id)) : null

    if (link === null) {
      return inline(['No such link. Try /links.'])
    }

    return window(`${link.category}.url`, 'link', { link: toLinkView(link) })
  },
})
