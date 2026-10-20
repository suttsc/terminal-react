import type { Metadata } from 'next'
import Link from 'next/link'
import { payloadRepositories } from '@/repositories/payload'
import { linkPath } from '@/routes'
import { loadLinks } from '@/services/link-pages'
import Page, { Card } from '@/shell/page'

export const metadata: Metadata = { title: 'links' }

export default async function LinksIndex() {
  const links = await loadLinks((await payloadRepositories()).links)

  return (
    <Page
      eyebrow="/links"
      title="Things other people wrote"
      lede="Still being thought about. The reasons are the closest thing to a blog so far."
    >
      {links.length === 0 ? (
        <p className="text-ink-dim">The shelf is empty. Reading is happening, allegedly.</p>
      ) : (
        <div className="flex flex-col gap-2.5">
          {links.map((link) => (
            <Card
              key={link.id}
              title={
                <Link href={linkPath(link.id)} className="hover:text-accent">
                  {link.title}
                </Link>
              }
              meta={[link.author, link.category].filter(Boolean).join(' · ')}
            >
              {link.reason}
            </Card>
          ))}
        </div>
      )}
    </Page>
  )
}
