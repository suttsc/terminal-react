import config from '@payload-config'
import { sql } from '@payloadcms/db-postgres'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import { TITLE_FETCH_SCHEDULED } from '@/collections/links'
import type { LinkCategory } from '@/lib/link-categories'
import type { Link, StravaActivity } from '@/payload-types'
import type {
  CountedStat,
  LinkRecord,
  LinksRepository,
  Repositories,
  RunsRepository,
  StatsRepository,
} from '@/repositories/types'
import { lazyRepositories } from '@/repositories/lazy'
import { RUN_SPORT_TYPES } from '@/repositories/types'

export const getPayloadClient = (): Promise<Payload> => getPayload({ config })

const toLinkRecord = (doc: Link): LinkRecord => ({
  id: doc.id,
  url: doc.url,
  title: doc.title || null,
  author: doc.author || null,
  category: doc.category as LinkCategory,
  reason: doc.reason,
  createdAt: new Date(doc.createdAt),
})

export class PayloadLinks implements LinksRepository {
  constructor(private readonly payload: Payload) {}

  async latest() {
    const { docs } = await this.payload.find({
      collection: 'links',
      sort: ['-createdAt', '-id'],
      pagination: false,
      depth: 0,
    })

    return docs.map(toLinkRecord)
  }

  async find(id: number) {
    const doc = await this.payload.findByID({
      collection: 'links',
      id,
      depth: 0,
      disableErrors: true,
    })

    return doc ? toLinkRecord(doc) : null
  }

  async create(link: Parameters<LinksRepository['create']>[0]) {
    const doc = await this.payload.create({
      collection: 'links',
      data: link,
      depth: 0,
      // The caller schedules the title fetch itself; the hook would do it twice.
      context: { [TITLE_FETCH_SCHEDULED]: true },
    })

    return toLinkRecord(doc)
  }

  async delete(id: number) {
    await this.payload.delete({ collection: 'links', id })
  }

  async setTitle(id: number, title: string) {
    await this.payload.update({ collection: 'links', id, data: { title }, depth: 0 })
  }

  async untitled() {
    const { docs } = await this.payload.find({
      collection: 'links',
      where: { or: [{ title: { exists: false } }, { title: { equals: '' } }] },
      pagination: false,
      depth: 0,
    })

    return docs.map(toLinkRecord)
  }
}

const toActivity = (doc: StravaActivity) => ({
  stravaId: doc.stravaId,
  name: doc.name,
  sportType: doc.sportType,
  distanceMetres: doc.distanceMetres,
  movingSeconds: doc.movingSeconds,
  elevationMetres: doc.elevationMetres,
  startedAt: new Date(doc.startedAt),
})

export class PayloadRuns implements RunsRepository {
  constructor(private readonly payload: Payload) {}

  async runsSince(since: Date) {
    const { docs } = await this.payload.find({
      collection: 'strava-activities',
      where: {
        sportType: { in: [...RUN_SPORT_TYPES] },
        startedAt: { greater_than_equal: since.toISOString() },
      },
      sort: 'startedAt',
      pagination: false,
      depth: 0,
    })

    return docs.map(toActivity)
  }

  async upsert(activities: Parameters<RunsRepository['upsert']>[0]) {
    for (const activity of activities) {
      const data = { ...activity, startedAt: activity.startedAt.toISOString() }
      const { docs } = await this.payload.find({
        collection: 'strava-activities',
        where: { stravaId: { equals: activity.stravaId } },
        limit: 1,
        depth: 0,
      })
      const existing = docs[0]

      if (existing) {
        await this.payload.update({
          collection: 'strava-activities',
          id: existing.id,
          data,
          depth: 0,
        })
      } else {
        await this.payload.create({ collection: 'strava-activities', data, depth: 0 })
      }
    }
  }
}

const columns: Record<CountedStat, string> = {
  deployCount: 'deploy_count',
  niceTryCount: 'nice_try_count',
}

export class PayloadStats implements StatsRepository {
  constructor(private readonly payload: Payload) {}

  async read() {
    const stats = await this.payload.findGlobal({ slug: 'site-stats', depth: 0 })

    return {
      deployCount: stats.deployCount ?? 0,
      niceTryCount: stats.niceTryCount ?? 0,
      stravaSyncedAt: stats.stravaSyncedAt ? new Date(stats.stravaSyncedAt) : null,
    }
  }

  /**
   * One statement, so two rejected sign-ins at once both count. The row is
   * seeded by a migration.
   */
  async increment(stat: CountedStat) {
    const column = sql.identifier(columns[stat])

    await this.payload.db.drizzle.execute(
      sql`UPDATE site_stats SET ${column} = COALESCE(${column}, 0) + 1, updated_at = now()`,
    )
  }

  async markStravaSynced(at: Date) {
    await this.payload.updateGlobal({
      slug: 'site-stats',
      data: { stravaSyncedAt: at.toISOString() },
      depth: 0,
    })
  }
}

/** Repositories for one request, connected only if a command reads or writes. */
export const lazyPayloadRepositories = (): Repositories => lazyRepositories(payloadRepositories)

export async function payloadRepositories(): Promise<Repositories> {
  const payload = await getPayloadClient()

  return {
    links: new PayloadLinks(payload),
    runs: new PayloadRuns(payload),
    stats: new PayloadStats(payload),
  }
}
