import { describe, expect, it } from 'vitest'
import { CommandNotFound } from '@/terminal/registry'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/deploy', () => {
  it('performs a deploy, theatrically', async () => {
    await expect(run('/deploy', makeTestContext({ isOwner: true }).ctx)).resolves.toEqual({
      type: 'inline',
      lines: [
        'pushing to main…',
        'build ok',
        'migrations 0 pending',
        'deployed in 34s',
        '',
        'None of that happened. Use git push like an adult.',
      ],
    })
  })

  it('does not exist for visitors', async () => {
    await expect(run('/deploy', makeTestContext().ctx)).rejects.toBeInstanceOf(CommandNotFound)
    expect(manifestSignatures(false)).not.toContain('/deploy')
    expect(manifestSignatures(true)).toContain('/deploy')
  })
})
