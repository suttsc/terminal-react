import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/about', () => {
  it('opens about.txt', async () => {
    await expect(run('/about', makeTestContext().ctx)).resolves.toEqual({
      type: 'window',
      title: 'about.txt',
      component: 'about',
      props: {},
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/about')
  })
})
