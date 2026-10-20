import type { PageTitleFetcher } from '@/integrations/page-title/page-title-fetcher'
import type { LinksRepository } from '@/repositories/types'

/**
 * Find a title for a link that hasn't got one. Leaves it alone on failure; the
 * daily cron tries again.
 */
export async function fetchLinkTitle(
  id: number,
  deps: { links: LinksRepository; fetcher: PageTitleFetcher },
): Promise<void> {
  const link = await deps.links.find(id)

  if (link === null || link.title !== null) {
    return
  }

  const title = await deps.fetcher.fetch(link.url)

  if (title !== null) {
    await deps.links.setTitle(id, title)
  }
}
