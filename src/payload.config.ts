import { postgresAdapter } from '@payloadcms/db-postgres'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildConfig } from 'payload'
import { Links } from '@/collections/links'
import { Projects } from '@/collections/projects'
import { StravaActivities } from '@/collections/strava-activities'
import { ToolLinks } from '@/collections/tool-links'
import { Users } from '@/collections/users'
import { Integrations } from '@/globals/integrations'
import { SiteStats } from '@/globals/site-stats'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  serverURL: process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : undefined,
  routes: {
    admin: '/admin',
    // Out of the way of /api/auth and /api/cron.
    api: '/payload-api',
  },
  admin: {
    user: Users.slug,
    importMap: { baseDir: dirname },
    meta: {
      titleSuffix: ' - suttsc',
      robots: { index: false, follow: false },
      defaultOGImageType: 'off',
    },
    components: {
      beforeLogin: ['@/auth/admin-login-button#AdminLoginButton'],
      logout: { Button: '@/auth/admin-logout-button#AdminLogoutButton' },
    },
  },
  collections: [Links, Projects, ToolLinks, StravaActivities, Users],
  globals: [SiteStats, Integrations],
  graphQL: { disable: true },
  telemetry: false,
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    // Schema changes go through committed migrations, never a dev push.
    push: false,
    migrationDir: path.resolve(dirname, 'migrations'),
  }),
})
