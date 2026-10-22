import { describe, expect, it } from 'vitest'
import { createRegistry, registry } from '@/terminal/registry'
import { constant, echo, hiddenConstant, ownerConstant, sneaky } from '../fixtures/commands'
import { makeTestContext, run } from '../support/make-test-context'

describe('answers shipped with the page', () => {
  const fixtures = createRegistry([echo, constant, ownerConstant, hiddenConstant])

  it('include only the pure commands this visitor may see', async () => {
    await expect(fixtures.answers({ isOwner: false })).resolves.toEqual({
      '/constant': { type: 'inline', lines: ['/constant', '2'] },
    })
  })

  it("include the owner's pure commands for the owner", async () => {
    expect(Object.keys(await fixtures.answers({ isOwner: true }))).toEqual([
      '/constant',
      '/owner constant',
    ])
  })

  it('refuse a command marked pure that reaches for anything else', async () => {
    await expect(createRegistry([sneaky]).answers({ isOwner: false })).rejects.toThrow(
      'A pure command reached for repositories.',
    )
  })

  it.each([false, true])(
    'match what the server would answer for every real pure command (owner: %s)',
    async (isOwner) => {
      const answers = await registry.answers({ isOwner })
      const { ctx } = makeTestContext({ isOwner })

      expect(Object.keys(answers).length).toBeGreaterThan(0)

      for (const [signature, answer] of Object.entries(answers)) {
        await expect(run(signature, ctx), signature).resolves.toEqual(answer)
      }
    },
  )

  it('cover the commands that read nothing, and none that read data', async () => {
    expect(Object.keys(await registry.answers({ isOwner: false }))).toEqual([
      '/about',
      '/ai',
      '/blog',
      '/help',
      '/hire',
      '/projects',
      '/tools',
      '/whoami',
    ])
    expect(Object.keys(await registry.answers({ isOwner: true }))).toEqual(
      expect.arrayContaining(['/deploy', '/link add']),
    )
  })
})
