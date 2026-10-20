import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/blog', () => {
  it('admits to no posts', async () => {
    await expect(run('/blog', makeTestContext().ctx)).resolves.toEqual({
      type: 'inline',
      lines: [
        '0 posts.',
        'There is a domain and everything.',
        '',
        'Try /links. The reasons there are the closest thing to writing so far.',
      ],
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/blog')
  })
})
