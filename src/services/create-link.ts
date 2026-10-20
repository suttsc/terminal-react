import type { LinkRecord, LinksRepository, NewLink } from '@/repositories/types'

/**
 * Shelve a link. Its title arrives later, once the response has gone.
 */
export async function createLink(
  link: NewLink,
  deps: { links: LinksRepository; scheduleTitleFetch: (id: number) => void },
): Promise<LinkRecord> {
  const record = await deps.links.create(link)

  deps.scheduleTitleFetch(record.id)

  return record
}
