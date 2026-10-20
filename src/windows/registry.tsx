'use client'

import type { ComponentType } from 'react'
import AboutWindow from '@/windows/about'
import AiWindow from '@/windows/ai'
import IncidentReportWindow from '@/windows/incident-report'
import LinkWindow from '@/windows/link'
import LinkAddWindow from '@/windows/link-add'
import NiceTryWindow from '@/windows/nice-try'
import StravaWindow from '@/windows/strava'
import Base64Tool from '@/windows/tools/base64'
import JwtTool from '@/windows/tools/jwt'
import TimestampTool from '@/windows/tools/timestamp'
import WhoamiWindow from '@/windows/whoami'

/**
 * Every component a window can be drawn with. The server's window() only
 * accepts these keys, so a typo fails tsc rather than the page.
 */
export const windows = {
  about: AboutWindow,
  ai: AiWindow,
  'nice-try': NiceTryWindow,
  link: LinkWindow,
  'link-add': LinkAddWindow,
  strava: StravaWindow,
  whoami: WhoamiWindow,
  'incident-report': IncidentReportWindow,
  'tool-base64': Base64Tool,
  'tool-jwt': JwtTool,
  'tool-timestamp': TimestampTool,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- each entry takes its own props
} satisfies Record<string, ComponentType<any>>

const isWindowKey = (key: string): key is keyof typeof windows => Object.hasOwn(windows, key)

type WindowBodyProps = {
  component: string
  props: Record<string, unknown>
}

/**
 * Draws whatever a window output names; an unknown name gets an empty window.
 */
export function WindowBody({ component, props }: WindowBodyProps) {
  if (!isWindowKey(component)) {
    return <p className="text-ink-dim">This window has nothing in it.</p>
  }

  const Component = windows[component] as ComponentType<Record<string, unknown>>

  return <Component {...props} />
}
