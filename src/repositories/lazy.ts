import type { Repositories } from '@/repositories/types'

/**
 * A repository whose methods load the real one on first use.
 */
function deferred<T extends object>(load: () => Promise<T>): T {
  return new Proxy({} as T, {
    get:
      (_target, method) =>
      async (...args: unknown[]) => {
        const repository = (await load()) as Record<PropertyKey, (...args: unknown[]) => unknown>

        return repository[method]?.(...args)
      },
  })
}

/**
 * Repositories that call `load` once, the first time any method is used. Commands
 * that never touch data never pay for the database connection.
 */
export function lazyRepositories(load: () => Promise<Repositories>): Repositories {
  let loaded: Promise<Repositories> | undefined
  const once = () => (loaded ??= load())

  return {
    links: deferred(async () => (await once()).links),
    runs: deferred(async () => (await once()).runs),
    stats: deferred(async () => (await once()).stats),
  }
}
