import { describe, expect, it } from 'vitest'
import nextConfig from '../../next.config'
import { generateStaticParams } from '@/app/(frontend)/tools/[tool]/page'
import { isToolSlug, toolEntry, toolLinkEntry, windowTools } from '@/lib/tools/registry'

describe('the tools', () => {
  it('lays out every window tool as a desktop icon', () => {
    expect(windowTools()).toHaveLength(3)
    expect(windowTools()[0]).toEqual({
      slug: 'base64',
      label: 'base64',
      description: 'Decode it, change it, encode it again',
      glyph: '64',
      href: null,
      component: 'tool-base64',
      wide: true,
      url: '/tools/base64',
    })
  })

  it('gives each window tool its own page, and no others', () => {
    expect(generateStaticParams()).toEqual([
      { tool: 'base64' },
      { tool: 'jwt' },
      { tool: 'timestamp' },
    ])
    expect(isToolSlug('nope')).toBe(false)
    expect(isToolSlug('toString')).toBe(false)
    expect(toolEntry('jwt').component).toBe('tool-jwt')
  })

  it('puts configured links on the desktop alongside the tools', () => {
    expect(
      toolLinkEntry({
        label: 'Regex 101',
        description: "Somebody else's tool",
        glyph: '.*',
        url: 'https://regex101.com',
      }),
    ).toEqual({
      slug: 'regex-101',
      label: 'Regex 101',
      description: "Somebody else's tool",
      glyph: '.*',
      href: 'https://regex101.com',
      component: null,
      wide: false,
      url: 'https://regex101.com',
    })
  })

  it('asks crawlers not to index /tools, /admin or the Payload API', async () => {
    const rules = (await nextConfig.headers?.()) ?? []
    const noIndexed = rules
      .filter((rule) =>
        rule.headers.some(
          (header) => header.key === 'X-Robots-Tag' && header.value === 'noindex, nofollow',
        ),
      )
      .map((rule) => rule.source)

    expect(noIndexed).toEqual(
      expect.arrayContaining([
        '/tools',
        '/tools/:path*',
        '/admin',
        '/admin/:path*',
        '/payload-api/:path*',
      ]),
    )
  })
})
