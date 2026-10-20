import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { isToolSlug, toolEntry, tools } from '@/lib/tools/registry'
import { routes } from '@/routes'
import Page from '@/shell/page'
import { WindowBody } from '@/windows/registry'

type Props = { params: Promise<{ tool: string }> }

export const dynamicParams = false

export const generateStaticParams = () => Object.keys(tools).map((tool) => ({ tool }))

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tool } = await params

  return {
    title: isToolSlug(tool) ? tools[tool].label : 'tools',
    robots: { index: false, follow: false },
  }
}

export default async function ToolsShow({ params }: Props) {
  const { tool: slug } = await params

  if (!isToolSlug(slug)) {
    notFound()
  }

  const tool = toolEntry(slug)

  return (
    <Page eyebrow="/tools" title={tool.label} lede={tool.description} wide={tool.wide}>
      <div className="rounded-[10px] border border-line-soft bg-surface px-[18px] py-4 text-[13.5px] leading-[1.7] text-ink-dim">
        {tool.component && <WindowBody component={tool.component} props={{}} />}
      </div>
      <p className="pt-6 font-mono text-[11px]">
        <Link href={routes.tools} className="text-ink-faint hover:text-accent">
          ← all tools
        </Link>
      </p>
    </Page>
  )
}
