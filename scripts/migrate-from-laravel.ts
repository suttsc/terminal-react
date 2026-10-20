/**
 * One-off: copy the Laravel database into this one. Run locally with both
 * connection strings, after `payload migrate` has created the tables:
 *
 *   LARAVEL_DATABASE_URL=postgres://… DATABASE_URI=postgres://… \
 *     pnpm tsx scripts/migrate-from-laravel.ts
 *
 * Sessions, cache and jobs stay behind; only the Strava refresh token is
 * rescued from the cache, since Strava rotates it.
 */
import pg from 'pg'

type LaravelLink = {
  id: number
  url: string
  title: string | null
  author: string | null
  category: string
  reason: string
  created_at: Date
  updated_at: Date
}

type LaravelActivity = {
  strava_id: string
  name: string
  sport_type: string
  distance_metres: number
  moving_seconds: number
  elevation_metres: number
  started_at: Date
  created_at: Date
  updated_at: Date
}

/** Laravel's cache serialises a string as s:<length>:"<value>"; */
function unserialiseString(value: string): string | null {
  return /^s:\d+:"(.*)";$/s.exec(value)?.[1] ?? null
}

async function main() {
  const { LARAVEL_DATABASE_URL, DATABASE_URI } = process.env

  if (!LARAVEL_DATABASE_URL || !DATABASE_URI) {
    throw new Error('Set LARAVEL_DATABASE_URL and DATABASE_URI.')
  }

  const from = new pg.Client({ connectionString: LARAVEL_DATABASE_URL })
  const to = new pg.Client({ connectionString: DATABASE_URI })
  await Promise.all([from.connect(), to.connect()])

  try {
    await to.query('BEGIN')

    const links = (await from.query<LaravelLink>('SELECT * FROM links ORDER BY id')).rows
    for (const link of links) {
      await to.query(
        `INSERT INTO links (id, url, title, author, category, reason, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         ON CONFLICT (id) DO NOTHING`,
        [
          link.id,
          link.url,
          link.title,
          link.author,
          link.category,
          link.reason,
          link.created_at,
          link.updated_at,
        ],
      )
    }
    await to.query(
      `SELECT setval(pg_get_serial_sequence('links', 'id'), GREATEST((SELECT MAX(id) FROM links), 1))`,
    )
    console.log(`links: ${links.length}`)

    const activities = (await from.query<LaravelActivity>('SELECT * FROM strava_activities')).rows
    for (const activity of activities) {
      await to.query(
        `INSERT INTO strava_activities
           (strava_id, name, sport_type, distance_metres, moving_seconds, elevation_metres, started_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         ON CONFLICT (strava_id) DO NOTHING`,
        [
          activity.strava_id,
          activity.name,
          activity.sport_type,
          activity.distance_metres,
          activity.moving_seconds,
          activity.elevation_metres,
          activity.started_at,
          activity.created_at,
          activity.updated_at,
        ],
      )
    }
    console.log(`strava activities: ${activities.length}`)

    const stats = Object.fromEntries(
      (
        await from.query<{ key: string; value: string }>('SELECT key, value FROM site_stats')
      ).rows.map((row) => [row.key, Number(row.value)]),
    )
    await to.query(
      `UPDATE site_stats SET deploy_count = $1, nice_try_count = $2, strava_synced_at = $3, updated_at = now()`,
      [
        stats.deploy_count ?? 0,
        stats.nice_try_count ?? 0,
        stats.strava_synced_at ? new Date(stats.strava_synced_at * 1000) : null,
      ],
    )
    console.log(`site stats: ${JSON.stringify(stats)}`)

    // The cache key carries Laravel's prefix, so match on the end of it.
    const cached = (
      await from.query<{ value: string }>(
        `SELECT value FROM cache WHERE key LIKE '%strava.refresh_token' LIMIT 1`,
      )
    ).rows[0]
    const token = cached ? unserialiseString(cached.value) : null
    if (token) {
      await to.query('UPDATE integrations SET strava_refresh_token = $1, updated_at = now()', [
        token,
      ])
    }
    console.log(
      `strava refresh token: ${token ? 'copied' : 'not found, the env value will seed it'}`,
    )

    await to.query('COMMIT')
  } catch (error) {
    await to.query('ROLLBACK')
    throw error
  } finally {
    await Promise.all([from.end(), to.end()])
  }
}

main().catch((error: unknown) => {
  console.error(error)
  process.exit(1)
})
