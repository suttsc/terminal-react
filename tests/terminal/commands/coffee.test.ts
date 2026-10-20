import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/coffee', () => {
  it('is a teapot', async () => {
    await expect(run('/coffee', makeTestContext().ctx)).resolves.toEqual({
      type: 'inline',
      lines: ["418 I'm a teapot", 'This server is, permanently, a teapot.'],
    })
  })

  it('runs but stays out of the manifest', () => {
    expect(manifestSignatures(false)).not.toContain('/coffee')
  })
})
