import { inMemoryRepositories } from '@/repositories/memory'
import type { LinkRecord, SiteStatsSnapshot, StravaActivityData } from '@/repositories/types'
import { registry } from '@/terminal/registry'
import type { Registry, RunContext } from '@/terminal/registry'
import type { CookieJar } from '@/terminal/types'

export class FakeCookieJar implements CookieJar {
  readonly plain = new Map<string, string>()
  readonly signed = new Map<string, string>()
  readonly maxAges = new Map<string, number | undefined>()

  constructor(initial: Record<string, string> = {}) {
    for (const [name, value] of Object.entries(initial)) {
      this.plain.set(name, value)
    }
  }

  get(name: string) {
    return this.plain.get(name)
  }

  set(name: string, value: string, options: { maxAge?: number } = {}) {
    this.plain.set(name, value)
    this.maxAges.set(name, options.maxAge)
  }

  getSigned(name: string) {
    return this.signed.get(name)
  }

  setSigned(name: string, value: string) {
    this.signed.set(name, value)
  }
}

export type TestContextOptions = {
  isOwner?: boolean
  links?: LinkRecord[]
  runs?: StravaActivityData[]
  stats?: Partial<SiteStatsSnapshot>
  cookies?: Record<string, string>
  now?: Date
}

/**
 * A command context over in-memory fakes: no Payload, no Postgres, no network.
 */
export function makeTestContext(options: TestContextOptions = {}) {
  const now = options.now ?? new Date('2026-10-20T12:00:00Z')
  const repos = inMemoryRepositories({
    links: options.links,
    runs: options.runs,
    stats: options.stats,
    now: () => now,
  })
  const cookies = new FakeCookieJar(options.cookies)
  const session = { signedOut: false, signOut: async () => void (session.signedOut = true) }

  const ctx: RunContext = {
    isOwner: options.isOwner ?? false,
    cookies,
    repos,
    session,
    now: () => now,
  }

  return { ctx, repos, cookies, session }
}

export const run = (input: string, ctx: RunContext, using: Registry = registry) =>
  using.run(input, ctx)

export const manifestSignatures = (isOwner: boolean, using: Registry = registry) =>
  using.manifest({ isOwner }).map((entry) => entry.signature)

export function linkRecord(overrides: Partial<LinkRecord> = {}): LinkRecord {
  return {
    id: 1,
    url: 'https://example.com/post',
    title: 'A post worth keeping',
    author: 'A. Writer',
    category: 'architecture',
    reason: 'Still thinking about it.',
    createdAt: new Date('2026-10-10T09:00:00Z'),
    ...overrides,
  }
}

export function activity(overrides: Partial<StravaActivityData> = {}): StravaActivityData {
  return {
    stravaId: 1,
    name: 'Morning',
    sportType: 'Run',
    distanceMetres: 5000,
    movingSeconds: 1500,
    elevationMetres: 20,
    startedAt: new Date('2026-10-09T07:00:00Z'),
    ...overrides,
  }
}
