import { inline } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

/**
 * Where an unmatched query lands. Canned on purpose: a model call mid-request
 * would break the rule against third-party calls in the request path.
 */
export default defineCommand({
  signature: '/ask',
  description: 'Ask a question',
  outcome: 'inline',
  hidden: true,
  handle: async (ctx) => {
    const question = ctx.args.join(' ')

    return inline([
      question === '' ? 'Ask what?' : `“${question}”`,
      '',
      'Thinking about it. Has been for a while.',
      'In the meantime, /help knows everything this machine admits to.',
    ])
  },
})
