import type {
  CountedStat,
  LinkRecord,
  LinksRepository,
  NewLink,
  Repositories,
  RunsRepository,
  SiteStatsSnapshot,
  StatsRepository,
  StravaActivityData,
} from '@/repositories/types'
import { RUN_SPORT_TYPES } from '@/repositories/types'

const newestFirst = (a: LinkRecord, b: LinkRecord) =>
  b.createdAt.getTime() - a.createdAt.getTime() || b.id - a.id

export class InMemoryLinks implements LinksRepository {
  readonly records: LinkRecord[]
  private nextId: number

  constructor(
    records: LinkRecord[] = [],
    private readonly now: () => Date = () => new Date(),
  ) {
    this.records = [...records]
    this.nextId = Math.max(0, ...records.map((record) => record.id)) + 1
  }

  async latest() {
    return [...this.records].sort(newestFirst)
  }

  async find(id: number) {
    return this.records.find((record) => record.id === id) ?? null
  }

  async create(link: NewLink) {
    const record: LinkRecord = { id: this.nextId++, title: null, createdAt: this.now(), ...link }
    this.records.push(record)

    return record
  }

  async delete(id: number) {
    const index = this.records.findIndex((record) => record.id === id)

    if (index >= 0) {
      this.records.splice(index, 1)
    }
  }

  async setTitle(id: number, title: string) {
    const record = this.records.find((candidate) => candidate.id === id)

    if (record) {
      record.title = title
    }
  }

  async untitled() {
    return this.records.filter((record) => record.title === null)
  }
}

export class InMemoryRuns implements RunsRepository {
  readonly activities: StravaActivityData[]

  constructor(activities: StravaActivityData[] = []) {
    this.activities = [...activities]
  }

  async runsSince(since: Date) {
    return this.activities
      .filter(
        (activity) =>
          (RUN_SPORT_TYPES as readonly string[]).includes(activity.sportType) &&
          activity.startedAt.getTime() >= since.getTime(),
      )
      .sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime())
  }

  async upsert(activities: StravaActivityData[]) {
    for (const activity of activities) {
      const index = this.activities.findIndex((existing) => existing.stravaId === activity.stravaId)

      if (index >= 0) {
        this.activities[index] = activity
      } else {
        this.activities.push(activity)
      }
    }
  }
}

export class InMemoryStats implements StatsRepository {
  readonly snapshot: SiteStatsSnapshot

  constructor(snapshot: Partial<SiteStatsSnapshot> = {}) {
    this.snapshot = { deployCount: 0, niceTryCount: 0, stravaSyncedAt: null, ...snapshot }
  }

  async read() {
    return { ...this.snapshot }
  }

  async increment(stat: CountedStat) {
    this.snapshot[stat] += 1
  }

  async markStravaSynced(at: Date) {
    this.snapshot.stravaSyncedAt = at
  }
}

export function inMemoryRepositories(
  seed: {
    links?: LinkRecord[]
    runs?: StravaActivityData[]
    stats?: Partial<SiteStatsSnapshot>
    now?: () => Date
  } = {},
): Repositories & { links: InMemoryLinks; runs: InMemoryRuns; stats: InMemoryStats } {
  return {
    links: new InMemoryLinks(seed.links, seed.now),
    runs: new InMemoryRuns(seed.runs),
    stats: new InMemoryStats(seed.stats),
  }
}
