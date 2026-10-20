import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/hire', () => {
  it('goes to /hire', async () => {
    await expect(run('/hire', makeTestContext().ctx)).resolves.toEqual({
      type: 'navigate',
      url: '/hire',
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/hire')
  })
})
