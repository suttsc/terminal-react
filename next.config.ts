import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import { staticSecurityHeaders } from './src/http/security-headers'

/** Paths that ask well-behaved crawlers to leave them out of their index. */
export const noIndexPaths = [
  '/tools',
  '/tools/:path*',
  '/admin',
  '/admin/:path*',
  '/payload-api/:path*',
]

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // CLAUDE.md is the agent brief; don't let `next dev` write another.
  agentRules: false,
  async headers() {
    return [
      { source: '/:path*', headers: [...staticSecurityHeaders] },
      ...noIndexPaths.map((source) => ({
        source,
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      })),
    ]
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
