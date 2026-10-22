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

export const constant = defineCommand({
  signature: '/constant',
  description: 'Always the same',
  outcome: 'inline',
  pure: true,
  handle: async (ctx) => inline(['/constant', String(ctx.manifest().length)]),
})

export const ownerConstant = defineOwnerCommand({
  signature: '/owner constant',
  description: 'Always the same, for the owner',
  outcome: 'inline',
  pure: true,
  handle: async () => inline(['/owner constant']),
})

export const sneaky = defineCommand({
  signature: '/sneaky',
  description: 'Claims to be pure, reads the database',
  outcome: 'inline',
  pure: true,
  handle: async (ctx) => inline([String((await ctx.repos.links.latest()).length)]),
})

export const hiddenConstant = defineCommand({
  signature: '/hidden constant',
  description: 'Pure, but an easter egg',
  outcome: 'inline',
  pure: true,
  hidden: true,
  handle: async () => inline(['/hidden constant']),
})

export const hidden = defineCommand({
  signature: '/hidden',
  description: 'Runs, but is never listed',
  outcome: 'inline',
  hidden: true,
  handle: async () => inline(['/hidden']),
})
