import { beforeEach, vi } from 'vitest'

beforeEach(() => {
  vi.unstubAllEnvs()
  vi.stubEnv('AUTH_SECRET', 'test-auth-secret-0123456789abcdef0123456789')
  vi.stubEnv('OWNER_EMAIL', 'suttsc@example.com')
  vi.stubEnv('SITE_REGISTERED_AT', '2026-08-26')
  vi.stubEnv('CRON_SECRET', 'test-cron-secret')
})
