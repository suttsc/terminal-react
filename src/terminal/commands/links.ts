import { linkHeading } from '@/services/link-view'
import { inline, menu, menuItem } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/links',
  description: "Things other people wrote that I'm still thinking about",
  outcome: 'menu',
  handle: async (ctx) => {
    const links = await ctx.repos.links.latest()

    if (links.length === 0) {
      return inline(['The shelf is empty. Reading is happening, allegedly.'])
    }

    return menu(
      'saved links',
      links.map((link) => menuItem(linkHeading(link), link.category, `/link ${link.id}`, 'window')),
    )
  },
})
