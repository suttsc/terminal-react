import type { StravaActivityData } from '@/repositories/types'

export type StravaClient = {
  /** The owner's activities since the given moment. */
  activitiesSince(since: Date): Promise<StravaActivityData[]>
}

/**
 * Where the rotating refresh token lives between runs.
 */
export type RefreshTokenStore = {
  get(): Promise<string | null>
  set(token: string): Promise<void>
}
