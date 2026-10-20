import { describe, expect, it } from 'vitest'
import { FakePageTitleFetcher } from '@/integrations/page-title/fake-page-title-fetcher'
import { InMemoryLinks } from '@/repositories/memory'
import { fetchLinkTitle } from '@/services/fetch-link-title'
import { retryLinkTitles } from '@/services/link-titles-job'
import { linkRecord } from '../support/make-test-context'

describe('fetching a link title', () => {
  it('stores the title it finds', async () => {
    const links = new InMemoryLinks([linkRecord({ title: null })])

    await fetchLinkTitle(1, {
      links,
      fetcher: new FakePageTitleFetcher({ 'https://example.com/post': 'Queues & you' }),
    })

    expect(links.records[0]?.title).toBe('Queues & you')
  })

  it('skips a link that already has a title', async () => {
    const links = new InMemoryLinks([linkRecord({ title: 'Mine' })])
    const fetcher = new FakePageTitleFetcher({ 'https://example.com/post': 'Theirs' })

    await fetchLinkTitle(1, { links, fetcher })

    expect(links.records[0]?.title).toBe('Mine')
    expect(fetcher.requested).toEqual([])
  })

  it('leaves the title empty when the page has none', async () => {
    const links = new InMemoryLinks([linkRecord({ title: null })])

    await fetchLinkTitle(1, { links, fetcher: new FakePageTitleFetcher() })

    expect(links.records[0]?.title).toBeNull()
  })

  it('does nothing for a link that has gone', async () => {
    await expect(
      fetchLinkTitle(9, { links: new InMemoryLinks(), fetcher: new FakePageTitleFetcher() }),
    ).resolves.toBeUndefined()
  })

  it('retries every untitled link from the cron', async () => {
    const links = new InMemoryLinks([
      linkRecord({ id: 1, title: null, url: 'https://a.test/' }),
      linkRecord({ id: 2, title: 'Done' }),
      linkRecord({ id: 3, title: null, url: 'https://b.test/' }),
    ])
    const fetcher = new FakePageTitleFetcher({ 'https://a.test/': 'A' })

    await expect(retryLinkTitles(links, fetcher)).resolves.toEqual({ attempted: 2 })
    expect(links.records.map((link) => link.title)).toEqual(['A', 'Done', null])
  })
})
