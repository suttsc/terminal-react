import { spawnSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'

/**
 * Only production builds migrate. Previews share the production database, so a
 * branch's schema change must never reach it before the branch is merged.
 */
export const shouldMigrate = (env: { VERCEL_ENV?: string }): boolean =>
  env.VERCEL_ENV === 'production'

function main() {
  if (!shouldMigrate({ VERCEL_ENV: process.env.VERCEL_ENV })) {
    console.log('Not a production build; migrations left for production.')

    return
  }

  const { status } = spawnSync('pnpm', ['migrate'], { stdio: 'inherit' })

  process.exit(status ?? 1)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main()
}
