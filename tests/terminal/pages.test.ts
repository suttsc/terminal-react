import { describe, expect, it } from 'vitest'
import { commands } from '@/terminal/commands'
import { createRegistry, registry } from '@/terminal/registry'
import { defineOwnerCommand } from '@/terminal/types'
import { inline } from '@/terminal/output'

describe('command pages', () => {
  it('exist for the commands that show content', () => {
    expect(registry.pages()).toEqual(['ai', 'blog', 'help', 'strava', 'uptime', 'whoami'])
  })

  it('are only ever declared on public, listed commands', () => {
    const declared = commands.filter((command) => command.page)

    for (const command of declared) {
      expect(command.hidden, command.signature).toBe(false)
      expect(command.authorized({ isOwner: false }), command.signature).toBe(true)
    }
  })

  it('are never given to an owner-only command', () => {
    const secret = defineOwnerCommand({
      signature: '/secret',
      description: 'Owner only',
      outcome: 'inline',
      page: true,
      handle: async () => inline(['no']),
    })

    expect(createRegistry([secret]).pages()).toEqual([])
  })
})
