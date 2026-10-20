import { describe, expect, it } from 'vitest'
import { CommandNotFound } from '@/terminal/registry'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/logout', () => {
  it('signs the owner out', async () => {
    const { ctx, session } = makeTestContext({ isOwner: true })

    await expect(run('/logout', ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['Signed out. You are suttsc again, unofficially.'],
    })
    expect(session.signedOut).toBe(true)
  })

  it('does not exist for visitors', async () => {
    const { ctx, session } = makeTestContext()

    await expect(run('/logout', ctx)).rejects.toBeInstanceOf(CommandNotFound)
    expect(session.signedOut).toBe(false)
    expect(manifestSignatures(false)).not.toContain('/logout')
    expect(manifestSignatures(true)).toContain('/logout')
  })
})
