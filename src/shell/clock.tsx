'use client'

import { useSyncExternalStore } from 'react'
import { useShell } from '@/shell/shell-context'

function everySecond(tick: () => void) {
  const timer = setInterval(tick, 1000)

  return () => clearInterval(timer)
}

const currentMinute = () => Math.floor(Date.now() / 60_000)

// The server has no business guessing the time the page will be read at.
const noMinute = () => null

/**
 * suttsc's time, not the visitor's.
 */
export default function Clock() {
  const { ownerTimezone } = useShell()
  const minute = useSyncExternalStore(everySecond, currentMinute, noMinute)
  const now = minute === null ? null : new Date(minute * 60_000)

  const time = now
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: ownerTimezone,
        hour: '2-digit',
        minute: '2-digit',
      }).format(now)
    : '--:--'
  const date = now
    ? new Intl.DateTimeFormat('en-GB', {
        timeZone: ownerTimezone,
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      })
        .format(now)
        .replace(',', '')
    : ''

  return (
    <p className="pl-2.5 text-right font-mono text-[11.5px] leading-[1.35] whitespace-nowrap text-ink-dim tabular-nums">
      <span className="sr-only">suttsc local time </span>
      <time dateTime={now?.toISOString()}>{time}</time>
      <span className="block text-[9.5px] tracking-[0.1em] text-ink-faint uppercase">{date}</span>
    </p>
  )
}
