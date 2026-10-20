import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/login', () => {
  it('hands a visitor to Google', async () => {
    await expect(run('/login', makeTestContext().ctx)).resolves.toEqual({
      type: 'navigate',
      url: '/auth/google',
    })
  })

  it('tells the owner they are already in', async () => {
    await expect(run('/login', makeTestContext({ isOwner: true }).ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['Already signed in. Still suttsc.'],
    })
  })

  it('runs but stays out of the manifest', () => {
    expect(manifestSignatures(false)).not.toContain('/login')
    expect(manifestSignatures(true)).not.toContain('/login')
  })
})
