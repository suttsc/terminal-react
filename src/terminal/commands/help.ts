import { menu, menuItem } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

export default defineCommand({
  signature: '/help',
  description: 'Everything this thing can do',
  outcome: 'menu',
  handle: async (ctx) =>
    menu(
      'commands',
      ctx
        .manifest()
        .map((command) =>
          menuItem(command.signature, command.description, command.signature, command.outcome),
        ),
    ),
})
