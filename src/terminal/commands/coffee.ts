import { inline } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/coffee',
  description: 'Brew coffee',
  outcome: 'inline',
  hidden: true,
  handle: async () => inline(["418 I'm a teapot", 'This server is, permanently, a teapot.']),
})
