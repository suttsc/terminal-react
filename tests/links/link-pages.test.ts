import { describe, expect, it } from 'vitest'
import { InMemoryLinks } from '@/repositories/memory'
import { loadLink, loadLinks } from '@/services/link-pages'
import { linkRecord } from '../support/make-test-context'

describe('the link pages', () => {
  const links = new InMemoryLinks([
    linkRecord({ id: 1, createdAt: new Date('2026-10-01T00:00:00Z') }),
    linkRecord({ id: 2, title: null, createdAt: new Date('2026-10-02T00:00:00Z') }),
  ])

  it('lists every link, newest first', async () => {
    expect((await loadLinks(links)).map((link) => [link.id, link.title])).toEqual([
      [2, 'https://example.com/post'],
      [1, 'A post worth keeping'],
    ])
  })

  it('shows one link', async () => {
    await expect(loadLink(links, '1')).resolves.toMatchObject({ id: 1, savedOn: '2026-10-01' })
  })

  it.each(['99', 'abc', '1.0', '-1', ''])('has no page for %j', async (id) => {
    await expect(loadLink(links, id)).resolves.toBeNull()
  })
})
