import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/whoami', () => {
  it('opens whoami.txt, which the server knows nothing about', async () => {
    await expect(run('/whoami', makeTestContext().ctx)).resolves.toEqual({
      type: 'window',
      title: 'whoami.txt',
      component: 'whoami',
      props: {},
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/whoami')
  })
})
