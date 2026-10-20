import { describe, expect, it } from 'vitest'
import { timeAgo } from '@/services/relative-time'

const now = new Date('2026-10-20T12:00:00Z')
const before = (seconds: number) => new Date(now.getTime() - seconds * 1000)

describe('timeAgo', () => {
  it.each([
    [5, '5 seconds ago'],
    [60, '1 minute ago'],
    [40 * 60, '40 minutes ago'],
    [3 * 3600 + 59 * 60, '3 hours ago'],
    [86_400, '1 day ago'],
    [15 * 86_400, '2 weeks ago'],
    [400 * 86_400, '1 year ago'],
  ])('says %i seconds is %j', (seconds, expected) => {
    expect(timeAgo(before(seconds), now)).toBe(expected)
  })
})
