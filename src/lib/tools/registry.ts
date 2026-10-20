import { toolPath } from '@/routes'
import type { WindowKey } from '@/terminal/output'

/**
 * The window tools on /tools. Each runs entirely in the browser: nothing typed
 * into one is sent anywhere. Plain links on the same desktop live in the
 * tool-links collection, since they need no code.
 */
export const tools = {
  base64: {
    label: 'base64',
    description: 'Decode it, change it, encode it again',
    glyph: '64',
    // Side-by-side panes.
    wide: true,
  },
  jwt: { label: 'jwt', description: 'Read a token. Trust nothing', glyph: '{·}', wide: false },
  timestamp: {
    label: 'timestamp',
    description: 'Unix time, in three time zones',
    glyph: '⏱',
    wide: false,
  },
} as const

export type ToolSlug = keyof typeof tools

export type ToolEntry = {
  slug: string
  label: string
  description: string
  glyph: string
  /** Set for plain links; window tools open in place instead. */
  href: string | null
  component: WindowKey | null
  wide: boolean
  url: string
}

export const isToolSlug = (slug: string): slug is ToolSlug => Object.hasOwn(tools, slug)

export function toolEntry(slug: ToolSlug): ToolEntry {
  const tool = tools[slug]

  return { slug, ...tool, href: null, component: `tool-${slug}`, url: toolPath(slug) }
}

const slugify = (label: string) =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

export function toolLinkEntry(link: {
  label: string
  description: string
  glyph: string
  url: string
}): ToolEntry {
  return {
    slug: slugify(link.label),
    label: link.label,
    description: link.description,
    glyph: link.glyph,
    href: link.url,
    component: null,
    wide: false,
    url: link.url,
  }
}

export const windowTools = (): ToolEntry[] => (Object.keys(tools) as ToolSlug[]).map(toolEntry)
