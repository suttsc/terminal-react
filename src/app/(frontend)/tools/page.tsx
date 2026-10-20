import type { Metadata } from 'next'
import { toolLinkEntry, windowTools } from '@/lib/tools/registry'
import { listToolLinks } from '@/repositories/pages'
import ToolDesktop from './tool-desktop'

export const metadata: Metadata = {
  title: 'tools',
  robots: { index: false, follow: false },
}

export default async function ToolsIndex() {
  const links = await listToolLinks()

  return <ToolDesktop tools={[...windowTools(), ...links.map(toolLinkEntry)]} />
}
