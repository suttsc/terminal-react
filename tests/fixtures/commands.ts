import { inline } from '@/terminal/output'
import { defineCommand, defineOwnerCommand } from '@/terminal/types'

export const echo = defineCommand({
  signature: '/echo',
  description: 'Repeats what it is given',
  outcome: 'inline',
  handle: async (ctx) => inline(['/echo', ...ctx.args]),
})

export const echoLoud = defineCommand({
  signature: '/echo loud',
  description: 'Repeats it louder',
  outcome: 'inline',
  handle: async (ctx) => inline(['/echo loud', ...ctx.args]),
})

export const forbidden = defineOwnerCommand({
  signature: '/forbidden',
  description: 'Not for you',
  outcome: 'inline',
  handle: async () => inline(['/forbidden']),
})

export const hidden = defineCommand({
  signature: '/hidden',
  description: 'Runs, but is never listed',
  outcome: 'inline',
  hidden: true,
  handle: async () => inline(['/hidden']),
})
