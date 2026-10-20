const units: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 86_400],
  ['month', 30 * 86_400],
  ['week', 7 * 86_400],
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
]

/**
 * "40 minutes ago", "3 hours ago": the largest whole unit, rounded down.
 */
export function timeAgo(then: Date, now: Date): string {
  const seconds = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 1000))
  const format = new Intl.RelativeTimeFormat('en', { numeric: 'always' })

  for (const [unit, size] of units) {
    if (seconds >= size) {
      return format.format(-Math.floor(seconds / size), unit)
    }
  }

  return format.format(-seconds, 'second')
}
