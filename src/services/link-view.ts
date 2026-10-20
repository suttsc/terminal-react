import type { LinkRecord } from '@/repositories/types'

export type LinkView = {
  id: number
  url: string
  title: string
  author: string | null
  category: string
  reason: string
  savedOn: string
}

/**
 * The title, or the address until the post-response fetch has found one.
 */
export const linkHeading = (link: Pick<LinkRecord, 'title' | 'url'>): string =>
  link.title ?? link.url

export function toLinkView(link: LinkRecord): LinkView {
  return {
    id: link.id,
    url: link.url,
    title: linkHeading(link),
    author: link.author,
    category: link.category,
    reason: link.reason,
    savedOn: link.createdAt.toISOString().slice(0, 10),
  }
}
