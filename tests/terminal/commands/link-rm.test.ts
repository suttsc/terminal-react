import { describe, expect, it } from 'vitest'
import { CommandNotFound } from '@/terminal/registry'
import {
  linkRecord,
  makeTestContext,
  manifestSignatures,
  run,
} from '../../support/make-test-context'

describe('/link rm', () => {
  it('takes a link off the shelf', async () => {
    const { ctx, repos } = makeTestContext({ isOwner: true, links: [linkRecord({ id: 3 })] })

    await expect(run('/link rm 3', ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['Removed: A post worth keeping'],
    })
    expect(repos.links.records).toEqual([])
  })

  it('names an untitled link by its address', async () => {
    const { ctx } = makeTestContext({ isOwner: true, links: [linkRecord({ title: null })] })

    await expect(run('/link rm 1', ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['Removed: https://example.com/post'],
    })
  })

  it.each(['/link rm', '/link rm 99', '/link rm one'])('explains itself for %j', async (typed) => {
    const { ctx, repos } = makeTestContext({ isOwner: true, links: [linkRecord()] })

    await expect(run(typed, ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['Usage: /link rm <id>. No link by that id.'],
    })
    expect(repos.links.records).toHaveLength(1)
  })

  it('does not exist for visitors', async () => {
    const { ctx, repos } = makeTestContext({ links: [linkRecord()] })

    await expect(run('/link rm 1', ctx)).rejects.toBeInstanceOf(CommandNotFound)
    expect(repos.links.records).toHaveLength(1)
    expect(manifestSignatures(false)).not.toContain('/link rm')
    expect(manifestSignatures(true)).toContain('/link rm')
  })
})
