import { describe, expect, it, vi } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/uptime', () => {
  it('reports the days since registration, the deploys and the impersonations', async () => {
    vi.stubEnv('SITE_REGISTERED_AT', '2026-01-01')
    const { ctx } = makeTestContext({
      now: new Date('2026-01-11T09:30:00Z'),
      stats: { deployCount: 7, niceTryCount: 3 },
    })

    await expect(run('/uptime', ctx)).resolves.toEqual({
      type: 'inline',
      lines: [
        'domain registered          10 days ago',
        'deploys so far             7',
        'blog posts written         0',
        'impersonation attempts     3',
        'consecutive days without',
        '  touching the CSS         0',
      ],
    })
  })

  it('reports zero deploys before the first one is recorded', async () => {
    const output = await run('/uptime', makeTestContext().ctx)

    expect(output.type === 'inline' && output.lines[1]).toBe('deploys so far             0')
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/uptime')
  })
})
