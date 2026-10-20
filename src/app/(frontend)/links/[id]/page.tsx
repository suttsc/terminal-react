import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { payloadRepositories } from '@/repositories/payload'
import { loadLink } from '@/services/link-pages'
import Page from '@/shell/page'
import LinkWindow from '@/windows/link'

type Props = { params: Promise<{ id: string }> }

const findLink = cache(async (id: string) => loadLink((await payloadRepositories()).links, id))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const link = await findLink((await params).id)

  return { title: link?.title ?? 'links' }
}

export default async function LinksShow({ params }: Props) {
  const link = await findLink((await params).id)

  if (link === null) {
    notFound()
  }

  return (
    <Page eyebrow={`/links · ${link.category}`} title={link.title}>
      <div className="rounded-[10px] border border-line-soft bg-surface px-[18px] py-4 text-[13.5px] leading-[1.7] text-ink-dim">
        <LinkWindow link={link} showTitle={false} />
      </div>
    </Page>
  )
}
