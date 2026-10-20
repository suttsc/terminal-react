import { HttpPageTitleFetcher } from '@/integrations/page-title/http-page-title-fetcher'
import type { PageTitleFetcher } from '@/integrations/page-title/page-title-fetcher'
import type { LinksRepository } from '@/repositories/types'
import { fetchLinkTitle } from '@/services/fetch-link-title'

/**
 * Retries every link still waiting for a title, one at a time.
 */
export async function retryLinkTitles(
  links: LinksRepository,
  fetcher: PageTitleFetcher = new HttpPageTitleFetcher(),
): Promise<Record<string, unknown>> {
  const untitled = await links.untitled()

  for (const link of untitled) {
    await fetchLinkTitle(link.id, { links, fetcher })
  }

  return { attempted: untitled.length }
}
