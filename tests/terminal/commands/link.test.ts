import { describe, expect, it } from 'vitest'
import {
  linkRecord,
  makeTestContext,
  manifestSignatures,
  run,
} from '../../support/make-test-context'

describe('/link', () => {
  it('opens a saved link in a window named after its category', async () => {
    const { ctx } = makeTestContext({ links: [linkRecord({ id: 7, category: 'testing' })] })

    await expect(run('/link 7', ctx)).resolves.toEqual({
      type: 'window',
      title: 'testing.url',
      component: 'link',
      props: {
        link: {
          id: 7,
          url: 'https://example.com/post',
          title: 'A post worth keeping',
          author: 'A. Writer',
          category: 'testing',
          reason: 'Still thinking about it.',
          savedOn: '2026-10-10',
        },
      },
    })
  })

  it('shows the address until a title has been found', async () => {
    const { ctx } = makeTestContext({ links: [linkRecord({ title: null })] })
    const output = await run('/link 1', ctx)

    expect(output).toMatchObject({ props: { link: { title: 'https://example.com/post' } } })
  })

  it.each(['/link 99', '/link abc', '/link', '/link 1.5'])('has nothing for %j', async (typed) => {
    const { ctx } = makeTestContext({ links: [linkRecord()] })

    await expect(run(typed, ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['No such link. Try /links.'],
    })
  })

  it('runs but stays out of the manifest', () => {
    expect(manifestSignatures(false)).not.toContain('/link')
  })
})
