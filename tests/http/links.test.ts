import { describe, expect, it } from 'vitest'
import { createStoreLinkHandler } from '@/http/links'
import { InMemoryLinks } from '@/repositories/memory'

function setUp(isOwner: boolean) {
  const links = new InMemoryLinks([], () => new Date('2026-10-20T12:00:00Z'))
  const scheduled: number[] = []
  const handler = createStoreLinkHandler({
    isOwner: async () => isOwner,
    links: async () => links,
    scheduleTitleFetch: (id) => void scheduled.push(id),
  })

  return { links, scheduled, handler }
}

const valid = {
  url: 'https://example.com/post',
  category: 'architecture',
  reason: 'Still thinking about it.',
  author: 'A. Writer',
}

const post = (body: unknown) =>
  new Request('https://suttsc.com/api/links', {
    method: 'POST',
    headers: {
      host: 'suttsc.com',
      origin: 'https://suttsc.com',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

describe('POST /api/links', () => {
  it('shelves a link for the owner and schedules the title fetch', async () => {
    const { links, scheduled, handler } = setUp(true)
    const response = await handler(post(valid))

    expect(response.status).toBe(201)
    await expect(response.json()).resolves.toEqual({
      data: {
        id: 1,
        url: 'https://example.com/post',
        title: 'https://example.com/post',
        author: 'A. Writer',
        category: 'architecture',
        reason: 'Still thinking about it.',
        savedOn: '2026-10-20',
      },
    })
    expect(links.records).toMatchObject([{ id: 1, title: null, author: 'A. Writer' }])
    expect(scheduled).toEqual([1])
  })

  it('stores an empty author as none', async () => {
    const { links, handler } = setUp(true)

    await handler(post({ ...valid, author: '' }))

    expect(links.records[0]?.author).toBeNull()
  })

  it('answers anyone but the owner with a 404, and keeps nothing', async () => {
    const { links, scheduled, handler } = setUp(false)
    const response = await handler(post(valid))

    expect(response.status).toBe(404)
    expect(links.records).toEqual([])
    expect(scheduled).toEqual([])
  })

  it.each([
    ['missing url', { url: '' }, 'url'],
    ['not a url', { url: 'nonsense' }, 'url'],
    ['not http', { url: 'javascript:alert(1)' }, 'url'],
    ['too long a url', { url: `https://example.com/${'a'.repeat(2048)}` }, 'url'],
    ['unknown category', { category: 'gossip' }, 'category'],
    ['missing reason', { reason: '' }, 'reason'],
    ['too long a reason', { reason: 'a'.repeat(1001) }, 'reason'],
    ['too long an author', { author: 'a'.repeat(256) }, 'author'],
  ])('rejects a %s with a field error', async (_label, input, field) => {
    const { links, handler } = setUp(true)
    const response = await handler(post({ ...valid, ...input }))

    expect(response.status).toBe(422)
    expect(((await response.json()) as { errors: Record<string, string> }).errors).toHaveProperty(
      field,
    )
    expect(links.records).toEqual([])
  })
})
