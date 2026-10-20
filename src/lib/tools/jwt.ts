import { decode } from '@/lib/tools/base64'

export type DecodedJwt =
  | {
      ok: true
      header: string
      payload: string
      expiresAt: Date | null
    }
  | { ok: false; error: string }

function parseSegment(segment: string): Record<string, unknown> | null {
  const decoded = decode(segment)

  if (!decoded.ok) {
    return null
  }

  try {
    const parsed: unknown = JSON.parse(decoded.value)

    return typeof parsed === 'object' && parsed !== null
      ? (parsed as Record<string, unknown>)
      : null
  } catch {
    return null
  }
}

/**
 * Reads a token's header and payload. The signature is never checked.
 */
export function decodeJwt(token: string): DecodedJwt {
  const segments = token.trim().split('.')

  if (segments.length !== 3) {
    return { ok: false, error: 'A JWT has three parts. This has not.' }
  }

  const header = parseSegment(segments[0] ?? '')
  const payload = parseSegment(segments[1] ?? '')

  if (header === null || payload === null) {
    return { ok: false, error: 'The header or payload is not JSON.' }
  }

  return {
    ok: true,
    header: JSON.stringify(header, null, 2),
    payload: JSON.stringify(payload, null, 2),
    expiresAt: typeof payload.exp === 'number' ? new Date(payload.exp * 1000) : null,
  }
}
