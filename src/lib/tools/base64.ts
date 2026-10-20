export type Result = { ok: true; value: string } | { ok: false; error: string }

function bytesToBinary(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return binary
}

/**
 * Encodes text as UTF-8 first, so anything beyond Latin-1 survives the trip.
 */
export function encode(text: string, urlSafe: boolean): string {
  const encoded = btoa(bytesToBinary(new TextEncoder().encode(text)))

  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded
}

/**
 * Accepts standard or URL-safe base64, with or without padding.
 */
export function decode(text: string): Result {
  const normalised = text.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalised.padEnd(normalised.length + ((4 - (normalised.length % 4)) % 4), '=')

  try {
    const bytes = Uint8Array.from(atob(padded), (char) => char.charCodeAt(0))

    return {
      ok: true,
      value: new TextDecoder('utf-8', { fatal: true }).decode(bytes),
    }
  } catch {
    return { ok: false, error: 'Not base64. Or not text once decoded.' }
  }
}
