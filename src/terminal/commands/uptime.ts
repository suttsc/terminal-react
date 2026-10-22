import { site } from '@/site.config'
import { domainAgeInDays } from '@/services/site-stats'
import { inline } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/uptime',
  description: 'Statistics of questionable value',
  outcome: 'inline',
  page: true,
  handle: async (ctx) => {
    const stats = await ctx.repos.stats.read()

    return inline([
      `domain registered          ${domainAgeInDays(site.registeredAt, ctx.now())} days ago`,
      `deploys so far             ${stats.deployCount}`,
      'blog posts written         0',
      `impersonation attempts     ${stats.niceTryCount}`,
      'consecutive days without',
      '  touching the CSS         0',
    ])
  },
})
