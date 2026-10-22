import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import CommandMenu from '@/shell/command-menu'
import InlineLines from '@/shell/inline-lines'
import Page from '@/shell/page'
import { requestContext } from '@/terminal/context'
import { registry } from '@/terminal/registry'
import { WindowBody } from '@/windows/registry'

// Checked by hand as well: a dynamically rendered page doesn't enforce dynamicParams.
const isCommandPage = (signature: string): boolean => registry.pages().includes(signature)

type Props = { params: Promise<{ signature: string }> }

export const dynamicParams = false

export const generateStaticParams = () => registry.pages().map((signature) => ({ signature }))

const run = cache(async (signature: string) => registry.run(signature, await requestContext()))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return { title: `/${(await params).signature}` }
}

export default async function CommandPage({ params }: Props) {
  const { signature: name } = await params

  if (!isCommandPage(name)) {
    notFound()
  }

  const signature = `/${name}`
  const output = await run(signature)
  const title = output.type === 'window' ? output.title : signature

  return (
    <Page eyebrow={signature} title={title}>
      <div className="rounded-[10px] border border-line-soft bg-surface px-[18px] py-4 text-[13.5px] leading-[1.7] text-ink-dim">
        {output.type === 'inline' && <InlineLines lines={output.lines} />}
        {output.type === 'window' && (
          <WindowBody component={output.component} props={output.props} />
        )}
        {output.type === 'menu' && <CommandMenu items={output.items} />}
      </div>
    </Page>
  )
}
