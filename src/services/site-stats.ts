const DAY = 86_400_000

/**
 * Whole days since the domain was registered, counted in UTC.
 */
export function domainAgeInDays(registeredAt: string, now: Date): number {
  const registered = Date.parse(
    registeredAt.length === 10 ? `${registeredAt}T00:00:00Z` : registeredAt,
  )

  return Math.max(0, Math.floor((now.getTime() - registered) / DAY))
}
