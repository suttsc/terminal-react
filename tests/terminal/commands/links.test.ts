import { describe, expect, it } from 'vitest'
import {
  linkRecord,
  makeTestContext,
  manifestSignatures,
  run,
} from '../../support/make-test-context'

describe('/links', () => {
  it('lists the shelf newest first', async () => {
    const { ctx } = makeTestContext({
      links: [
        linkRecord({ id: 1, title: 'Older', createdAt: new Date('2026-10-01T00:00:00Z') }),
        linkRecord({
          id: 2,
          title: null,
          url: 'https://example.com/new',
          category: 'design',
          createdAt: new Date('2026-10-05T00:00:00Z'),
        }),
        linkRecord({
          id: 3,
          title: 'Same moment, higher id',
          createdAt: new Date('2026-10-01T00:00:00Z'),
        }),
      ],
    })

    await expect(run('/links', ctx)).resolves.toEqual({
      type: 'menu',
      label: 'saved links',
      items: [
        { label: 'https://example.com/new', hint: 'design', run: '/link 2', outcome: 'window' },
        {
          label: 'Same moment, higher id',
          hint: 'architecture',
          run: '/link 3',
          outcome: 'window',
        },
        { label: 'Older', hint: 'architecture', run: '/link 1', outcome: 'window' },
      ],
    })
  })

  it('admits to an empty shelf', async () => {
    await expect(run('/links', makeTestContext().ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['The shelf is empty. Reading is happening, allegedly.'],
    })
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/links')
  })
})
