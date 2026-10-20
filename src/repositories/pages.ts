import 'server-only'
import { getPayloadClient } from '@/repositories/payload'

export type ProjectView = {
  name: string
  summary: string
  stack: string
  url: string | null
}

export type ToolLinkView = {
  label: string
  description: string
  glyph: string
  url: string
}

/** What /projects lists, in its chosen order. */
export async function listProjects(): Promise<ProjectView[]> {
  const { docs } = await (
    await getPayloadClient()
  ).find({ collection: 'projects', sort: 'order', pagination: false, depth: 0 })

  return docs.map(({ name, summary, stack, url }) => ({ name, summary, stack, url: url || null }))
}

/** Plain links on the /tools desktop. */
export async function listToolLinks(): Promise<ToolLinkView[]> {
  const { docs } = await (
    await getPayloadClient()
  ).find({ collection: 'tool-links', sort: 'createdAt', pagination: false, depth: 0 })

  return docs.map(({ label, description, glyph, url }) => ({ label, description, glyph, url }))
}
