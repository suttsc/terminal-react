import type { PageTitleFetcher } from '@/integrations/page-title/page-title-fetcher'

export class FakePageTitleFetcher implements PageTitleFetcher {
  readonly requested: string[] = []

  /** @param titles Keyed by URL. */
  constructor(private readonly titles: Record<string, string> = {}) {}

  async fetch(url: string) {
    this.requested.push(url)

    return this.titles[url] ?? null
  }
}
