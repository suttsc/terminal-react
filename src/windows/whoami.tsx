'use client'

import { useSyncExternalStore } from 'react'

const neverChanges = () => () => {}

function browserName(): string {
  const agent = navigator.userAgent

  if (agent.includes('Firefox/')) {
    return 'Firefox'
  }

  if (agent.includes('Edg/')) {
    return 'Edge'
  }

  if (agent.includes('Chrome/')) {
    return 'Chrome'
  }

  return agent.includes('Safari/') ? 'Safari' : 'something unusual'
}

const browser = () => browserName()
const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone
const screenSize = () => `${window.screen.width}×${window.screen.height}`
const unknown = () => '…'

/**
 * Read at render time, in the browser, and discarded with the window.
 */
export default function WhoamiWindow() {
  const agent = useSyncExternalStore(neverChanges, browser, unknown)
  const zone = useSyncExternalStore(neverChanges, timezone, unknown)
  const screen = useSyncExternalStore(neverChanges, screenSize, unknown)

  const details = [
    ['browser', agent],
    ['timezone', zone],
    ['screen', screen],
    ['visits', '1'],
  ]

  return (
    <div className="flex flex-col gap-3">
      <p className="font-mono text-ink">suttsc</p>
      <p className="text-ink-dim">…hold on.</p>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-xs">
        {details.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-ink-faint">{label}</dt>
            <dd className="text-ink">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="text-warn">You are not suttsc.</p>
    </div>
  )
}
