import type { LinksRepository } from '@/repositories/types'
import { toLinkView } from '@/services/link-view'
import type { LinkView } from '@/services/link-view'

/** Every link, newest first, as the /links page shows them. */
export async function loadLinks(links: LinksRepository): Promise<LinkView[]> {
  return (await links.latest()).map(toLinkView)
}

/** One link for /links/[id], or null for anything that isn't a saved link's id. */
export async function loadLink(links: LinksRepository, id: string): Promise<LinkView | null> {
  if (!/^\d+$/.test(id)) {
    return null
  }

  const link = await links.find(Number(id))

  return link ? toLinkView(link) : null
}
