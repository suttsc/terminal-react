import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/projects', () => {
  it('goes to /projects', async () => {
    await expect(run('/projects', makeTestContext().ctx)).resolves.toEqual({
      type: 'navigate',
      url: '/projects',
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/projects')
  })
})
