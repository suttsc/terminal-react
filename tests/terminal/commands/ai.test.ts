import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/ai', () => {
  it('opens ai.txt', async () => {
    await expect(run('/ai', makeTestContext().ctx)).resolves.toEqual({
      type: 'window',
      title: 'ai.txt',
      component: 'ai',
      props: {},
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/ai')
  })
})
