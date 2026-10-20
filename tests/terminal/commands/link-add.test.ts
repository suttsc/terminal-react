import { describe, expect, it } from 'vitest'
import { CommandNotFound } from '@/terminal/registry'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/link add', () => {
  it('opens the new link form with every category', async () => {
    await expect(run('/link add', makeTestContext({ isOwner: true }).ctx)).resolves.toEqual({
      type: 'window',
      title: 'new-link.url',
      component: 'link-add',
      props: {
        categories: ['architecture', 'laravel', 'leadership', 'design', 'testing', 'other'],
      },
    })
  })

  it('does not exist for visitors, not even as /link', async () => {
    await expect(run('/link add', makeTestContext().ctx)).rejects.toBeInstanceOf(CommandNotFound)
    expect(manifestSignatures(false)).not.toContain('/link add')
    expect(manifestSignatures(true)).toContain('/link add')
  })
})
