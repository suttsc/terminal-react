import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/tools', () => {
  it('goes to /tools', async () => {
    await expect(run('/tools', makeTestContext().ctx)).resolves.toEqual({
      type: 'navigate',
      url: '/tools',
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/tools')
  })
})
