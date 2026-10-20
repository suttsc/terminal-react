import { HttpPageTitleFetcher } from '@/integrations/page-title/http-page-title-fetcher'
import { payloadRepositories } from '@/repositories/payload'
import { fetchLinkTitle } from '@/services/fetch-link-title'

/**
 * Production wiring for a title fetch. Only ever called from `after()` or the
 * cron, once nobody is waiting on the response.
 */
export async function fetchTitleNow(id: number): Promise<void> {
  const { links } = await payloadRepositories()

  await fetchLinkTitle(id, { links, fetcher: new HttpPageTitleFetcher() })
}
