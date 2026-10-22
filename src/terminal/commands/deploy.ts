import { inline } from '@/terminal/output'
import { defineOwnerCommand } from '@/terminal/types'

/**
 * Theatre. A web request has no business starting a deploy.
 */
export default defineOwnerCommand({
  signature: '/deploy',
  description: 'Ship it',
  outcome: 'inline',
  pure: true,
  handle: async () =>
    inline([
      'pushing to main…',
      'build ok',
      'migrations 0 pending',
      'deployed in 34s',
      '',
      'None of that happened. Use git push like an adult.',
    ]),
})
