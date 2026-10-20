import { pathToFileURL } from 'node:url'
import type { StatsRepository } from '@/repositories/types'

/**
 * Counts a production deploy, for /uptime. Previews and local builds don't count.
 */
export async function recordDeploy(
  env: { VERCEL_ENV?: string },
  stats: () => Promise<StatsRepository>,
): Promise<boolean> {
  if (env.VERCEL_ENV !== 'production') {
    return false
  }

  await (await stats()).increment('deployCount')

  return true
}

async function main() {
  const recorded = await recordDeploy({ VERCEL_ENV: process.env.VERCEL_ENV }, async () => {
    const { payloadRepositories } = await import('@/repositories/payload')

    return (await payloadRepositories()).stats
  })

  console.log(recorded ? 'Deploy recorded.' : 'Not a production deploy; nothing recorded.')
  process.exit(0)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    console.error(error)
    process.exit(1)
  })
}
