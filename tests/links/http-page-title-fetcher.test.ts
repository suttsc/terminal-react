import { describe, expect, it, vi } from 'vitest'
import { HttpPageTitleFetcher } from '@/integrations/page-title/http-page-title-fetcher'

const respond = (body: string, status = 200) =>
  vi.fn<typeof fetch>(async () => new Response(body, { status }))

describe('the HTTP page title fetcher', () => {
  it('reads and tidies the page title', async () => {
    const fetchImpl = respond(
      '<html><head><title data-x="1">\n  Queues &amp; you &#8212; &hellip;  </title></head></html>',
    )

    await expect(
      new HttpPageTitleFetcher(fetchImpl).fetch('https://example.com/post'),
    ).resolves.toBe('Queues & you — …')
  })

  it('introduces itself and gives up after ten seconds', async () => {
    const fetchImpl = respond('<title>Hi</title>')

    await new HttpPageTitleFetcher(fetchImpl).fetch('https://example.com/post')

    const [url, init] = fetchImpl.mock.calls[0] ?? []
    expect(url).toBe('https://example.com/post')
    expect(init?.headers).toEqual({ 'User-Agent': 'suttsc.com link shelf' })
    expect(init?.signal).toBeInstanceOf(AbortSignal)
  })

  it('caps the title at 255 characters', async () => {
    const title = await new HttpPageTitleFetcher(
      respond(`<title>${'a'.repeat(300)}</title>`),
    ).fetch('https://x.test')

    expect(title).toHaveLength(255)
  })

  it.each([
    ['a server error', respond('<title>Error</title>', 500)],
    ['no title', respond('<html></html>')],
    ['an empty title', respond('<title>   </title>')],
    [
      'a timeout',
      vi.fn<typeof fetch>(async () =>
        Promise.reject(new DOMException('timed out', 'TimeoutError')),
      ),
    ],
  ])('returns null for %s', async (_label, fetchImpl) => {
    await expect(
      new HttpPageTitleFetcher(fetchImpl).fetch('https://example.com/post'),
    ).resolves.toBeNull()
  })
})
