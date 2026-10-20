import { describe, expect, it } from 'vitest'
import { InMemoryStats } from '@/repositories/memory'
import { recordDeploy } from '../scripts/record-deploy'

describe('record-deploy', () => {
  it('counts a production deploy', async () => {
    const stats = new InMemoryStats({ deployCount: 4 })

    await expect(recordDeploy({ VERCEL_ENV: 'production' }, async () => stats)).resolves.toBe(true)
    expect(stats.snapshot.deployCount).toBe(5)
  })

  it.each(['preview', 'development', undefined])('ignores a %s build', async (env) => {
    const stats = new InMemoryStats()

    await expect(recordDeploy({ VERCEL_ENV: env }, async () => stats)).resolves.toBe(false)
    expect(stats.snapshot.deployCount).toBe(0)
  })
})
