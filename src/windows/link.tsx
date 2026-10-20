import NextLink from 'next/link'
import { linkPath } from '@/routes'
import type { LinkView as Link } from '@/services/link-view'

export type LinkWindowProps = {
  link: Link
  /** The link's own page already shows the title as its heading. */
  showTitle?: boolean
}

export default function LinkWindow({ link, showTitle = true }: LinkWindowProps) {
  return (
    <article className="flex flex-col gap-3">
      {showTitle && <h3 className="text-[15px] font-semibold text-ink">{link.title}</h3>}
      <p className="font-mono text-[11.5px] text-ink-faint">
        {[link.author, link.category].filter(Boolean).join('  ·  ')}
      </p>
      <p>{link.reason}</p>
      <p className="flex gap-4 font-mono text-[11.5px]">
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-info hover:underline"
        >
          open original ↗
        </a>
        <NextLink href={linkPath(link.id)} className="text-ink-faint hover:text-ink">
          #{link.id} · {link.savedOn}
        </NextLink>
      </p>
    </article>
  )
}
