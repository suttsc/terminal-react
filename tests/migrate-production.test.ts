import { describe, expect, it } from 'vitest'
import { shouldMigrate } from '../scripts/migrate-production'

describe('migrate-production', () => {
  it('migrates a production build', () => {
    expect(shouldMigrate({ VERCEL_ENV: 'production' })).toBe(true)
  })

  it.each(['preview', 'development', undefined])(
    'leaves the schema alone for a %s build',
    (env) => {
      expect(shouldMigrate({ VERCEL_ENV: env })).toBe(false)
    },
  )
})
