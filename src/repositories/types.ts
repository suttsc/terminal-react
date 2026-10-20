import type { LinkCategory } from '@/lib/link-categories'

export type LinkRecord = {
  id: number
  url: string
  /** Null until the post-response fetch has found one. */
  title: string | null
  author: string | null
  category: LinkCategory
  reason: string
  createdAt: Date
}

export type NewLink = Pick<LinkRecord, 'url' | 'category' | 'reason' | 'author'>

export type LinksRepository = {
  /** Newest first, then highest id first. */
  latest(): Promise<LinkRecord[]>
  find(id: number): Promise<LinkRecord | null>
  create(link: NewLink): Promise<LinkRecord>
  delete(id: number): Promise<void>
  setTitle(id: number, title: string): Promise<void>
  /** Links still waiting for a title. */
  untitled(): Promise<LinkRecord[]>
}

export type StravaActivityData = {
  stravaId: number
  name: string
  sportType: string
  distanceMetres: number
  movingSeconds: number
  elevationMetres: number
  startedAt: Date
}

export const RUN_SPORT_TYPES = ['Run', 'TrailRun', 'VirtualRun'] as const

export type RunsRepository = {
  /** Runs (not rides, swims or walks) started at or after `since`, oldest first. */
  runsSince(since: Date): Promise<StravaActivityData[]>
  /** Insert new activities and update ones already mirrored, keyed by stravaId. */
  upsert(activities: StravaActivityData[]): Promise<void>
}

export type SiteStatsSnapshot = {
  deployCount: number
  niceTryCount: number
  stravaSyncedAt: Date | null
}

export type CountedStat = 'deployCount' | 'niceTryCount'

export type StatsRepository = {
  read(): Promise<SiteStatsSnapshot>
  /** One atomic step up; never read-then-write. */
  increment(stat: CountedStat): Promise<void>
  markStravaSynced(at: Date): Promise<void>
}

export type Repositories = {
  links: LinksRepository
  runs: RunsRepository
  stats: StatsRepository
}
