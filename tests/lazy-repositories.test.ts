import { describe, expect, it, vi } from 'vitest'
import { lazyRepositories } from '@/repositories/lazy'
import { inMemoryRepositories } from '@/repositories/memory'
import { linkRecord } from './support/make-test-context'

describe('lazy repositories', () => {
  it('connect only when a command first uses one, and only once', async () => {
    const real = inMemoryRepositories({ links: [linkRecord()], stats: { deployCount: 3 } })
    const load = vi.fn(async () => real)
    const repos = lazyRepositories(load)

    expect(load).not.toHaveBeenCalled()

    await expect(repos.links.find(1)).resolves.toMatchObject({ id: 1 })
    await expect(repos.stats.read()).resolves.toMatchObject({ deployCount: 3 })

    expect(load).toHaveBeenCalledTimes(1)
  })
})
