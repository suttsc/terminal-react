import { readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { commandFiles } from '@/terminal/commands'
import { CommandNotFound, createRegistry, registry } from '@/terminal/registry'
import { echo, echoLoud, forbidden, hidden } from '../fixtures/commands'
import { makeTestContext, run } from '../support/make-test-context'

// Listed out of order on purpose: the manifest sorts by signature.
const fixtures = createRegistry([hidden, forbidden, echoLoud, echo])

describe('the command registry', () => {
  it('ships only listed, authorised commands in the manifest, ordered by signature', () => {
    expect(fixtures.manifest({ isOwner: false })).toEqual([
      { signature: '/echo', description: 'Repeats what it is given', outcome: 'inline' },
      { signature: '/echo loud', description: 'Repeats it louder', outcome: 'inline' },
    ])
  })

  it('lists owner commands for the owner', () => {
    expect(fixtures.manifest({ isOwner: true }).map((entry) => entry.signature)).toEqual([
      '/echo',
      '/echo loud',
      '/forbidden',
    ])
  })

  it('runs a hidden command that the manifest leaves out', async () => {
    const { ctx } = makeTestContext()

    await expect(run('/hidden', ctx, fixtures)).resolves.toEqual({
      type: 'inline',
      lines: ['/hidden'],
    })
  })

  it('answers an unauthorised command exactly as a missing one', async () => {
    const { ctx } = makeTestContext()

    await expect(run('/forbidden', ctx, fixtures)).rejects.toBeInstanceOf(CommandNotFound)
    await expect(run('/nope', ctx, fixtures)).rejects.toBeInstanceOf(CommandNotFound)
  })

  it('runs an owner command for the owner', async () => {
    const { ctx } = makeTestContext({ isOwner: true })

    await expect(run('/forbidden', ctx, fixtures)).resolves.toEqual({
      type: 'inline',
      lines: ['/forbidden'],
    })
  })

  it('passes the words after the signature to the command as arguments', async () => {
    const { ctx } = makeTestContext()

    await expect(run('/echo Hello  there', ctx, fixtures)).resolves.toEqual({
      type: 'inline',
      lines: ['/echo', 'Hello', 'there'],
    })
  })

  it('prefers the longest matching signature', async () => {
    const { ctx } = makeTestContext()

    await expect(run('/echo loud Hello', ctx, fixtures)).resolves.toEqual({
      type: 'inline',
      lines: ['/echo loud', 'Hello'],
    })
  })

  it.each(['echo', '/ECHO', '  /echo  ', '//echo'])(
    'matches %j typed without its slash or in another case',
    async (typed) => {
      const { ctx } = makeTestContext()

      await expect(run(typed, ctx, fixtures)).resolves.toEqual({ type: 'inline', lines: ['/echo'] })
    },
  )

  it('does not match a command that merely starts with a signature', async () => {
    const { ctx } = makeTestContext()

    await expect(run('/echoes', ctx, fixtures)).rejects.toBeInstanceOf(CommandNotFound)
  })

  it("does not leak one run's arguments into the next", async () => {
    const { ctx } = makeTestContext()

    await run('/echo first', ctx, fixtures)

    await expect(run('/echo', ctx, fixtures)).resolves.toEqual({ type: 'inline', lines: ['/echo'] })
  })
})

describe('the real command list', () => {
  it('registers every file in commands/', () => {
    const files = readdirSync(new URL('../../src/terminal/commands', import.meta.url))
      .filter((file) => file.endsWith('.ts') && file !== 'index.ts')
      .map((file) => file.replace(/\.ts$/, ''))
      .sort()

    expect(Object.keys(commandFiles).sort()).toEqual(files)
  })

  it('has one test per command', () => {
    const tests = readdirSync(new URL('./commands', import.meta.url))
      .map((file) => file.replace(/\.test\.ts$/, ''))
      .sort()

    expect(tests).toEqual(Object.keys(commandFiles).sort())
  })

  it('holds 21 commands with unique signatures', () => {
    const signatures = Object.values(commandFiles).map((command) => command.signature)

    expect(new Set(signatures).size).toBe(21)
  })

  it('lists the public commands for a visitor, sorted by signature', () => {
    expect(registry.manifest({ isOwner: false }).map((entry) => entry.signature)).toEqual([
      '/about',
      '/ai',
      '/blog',
      '/help',
      '/hire',
      '/links',
      '/projects',
      '/strava',
      '/sudo',
      '/theme',
      '/tools',
      '/uptime',
      '/whoami',
    ])
  })
})
