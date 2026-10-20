import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/help', () => {
  it('lists what this visitor may run, with each badge', async () => {
    const output = await run('/help', makeTestContext().ctx)

    expect(output).toMatchObject({ type: 'menu', label: 'commands' })
    expect(output.type === 'menu' && output.items[0]).toEqual({
      label: '/about',
      hint: 'Who is running this',
      run: '/about',
      outcome: 'window',
    })
    expect(output.type === 'menu' && output.items.map((item) => item.label)).toEqual(
      manifestSignatures(false),
    )
  })

  it('includes the owner commands for the owner', async () => {
    const output = await run('/help', makeTestContext({ isOwner: true }).ctx)

    expect(output.type === 'menu' && output.items.map((item) => item.label)).toContain('/logout')
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/help')
  })
})
