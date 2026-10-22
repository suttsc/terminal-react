import { inline } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/blog',
  description: 'Words, eventually',
  outcome: 'inline',
  pure: true,
  handle: async () =>
    inline([
      '0 posts.',
      'There is a domain and everything.',
      '',
      'Try /links. The reasons there are the closest thing to writing so far.',
    ]),
})
