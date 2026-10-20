import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/ask', () => {
  it('quotes the question back and promises nothing', async () => {
    await expect(run('/ask Is this   real?', makeTestContext().ctx)).resolves.toEqual({
      type: 'inline',
      lines: [
        '“Is this real?”',
        '',
        'Thinking about it. Has been for a while.',
        'In the meantime, /help knows everything this machine admits to.',
      ],
    })
  })

  it('asks what, when asked nothing', async () => {
    const output = await run('/ask', makeTestContext().ctx)

    expect(output.type === 'inline' && output.lines[0]).toBe('Ask what?')
  })

  it('runs but stays out of the manifest', () => {
    expect(manifestSignatures(false)).not.toContain('/ask')
    expect(manifestSignatures(true)).not.toContain('/ask')
  })
})
