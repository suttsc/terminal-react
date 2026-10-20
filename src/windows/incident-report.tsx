'use client'

import { useSyncExternalStore } from 'react'

export type IncidentReportWindowProps = {
  attempts: number
}

const neverChanges = () => () => {}

const timezone = () => Intl.DateTimeFormat().resolvedOptions().timeZone
const referrer = () => document.referrer || 'none — suspicious'
const unknown = () => 'unknown'

/**
 * Everything here is read in the browser and goes nowhere.
 */
export default function IncidentReportWindow({ attempts }: IncidentReportWindowProps) {
  const zone = useSyncExternalStore(neverChanges, timezone, unknown)
  const from = useSyncExternalStore(neverChanges, referrer, unknown)

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-[15px] font-semibold text-ink">INCIDENT REPORT</h3>
      <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1 font-mono text-xs leading-[1.9]">
        <dt className="text-ink-faint">attempts</dt>
        <dd className="text-ink">{attempts}</dd>
        <dt className="text-ink-faint">timezone</dt>
        <dd className="text-ink">{zone}</dd>
        <dt className="text-ink-faint">referrer</dt>
        <dd className="break-all text-ink">{from}</dd>
        <dt className="text-ink-faint">verdict</dt>
        <dd className="text-ink">persistent</dd>
      </dl>
      <p>Filed. It will be read never.</p>
    </div>
  )
}
