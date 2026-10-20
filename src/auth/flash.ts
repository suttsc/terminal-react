import { EncryptJWT, jwtDecrypt } from 'jose'
import { derivedKey, secureCookies } from '@/lib/secrets'

export const FLASH_COOKIE = 'suttsc_flash'
/** The request header the proxy forwards the flash in; never trusted unsealed. */
export const FLASH_HEADER = 'x-suttsc-flash'

export type Rejection = { name: string | null; email: string | null }

/**
 * What a sign-in left for the next render: a welcome, or a rejected visitor's
 * own details. Gone after one render, never stored.
 */
export type Flash = { signedIn: true } | { rejection: Rejection }

const LIFETIME_SECONDS = 60

export async function sealFlash(flash: Flash): Promise<string> {
  return new EncryptJWT({ flash })
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${LIFETIME_SECONDS}s`)
    .encrypt(derivedKey('flash'))
}

export async function openFlash(sealed: string | null | undefined): Promise<Flash | null> {
  if (!sealed) {
    return null
  }

  try {
    const { payload } = await jwtDecrypt(sealed, derivedKey('flash'))
    const flash = payload.flash as Partial<{ signedIn: unknown; rejection: Partial<Rejection> }>

    if (flash?.signedIn === true) {
      return { signedIn: true }
    }

    if (flash?.rejection) {
      return {
        rejection: { name: flash.rejection.name ?? null, email: flash.rejection.email ?? null },
      }
    }
  } catch {
    // Expired, forged or sealed with another secret: there is nothing to show.
  }

  return null
}

export const flashCookieOptions = () =>
  ({
    httpOnly: true,
    sameSite: 'lax',
    secure: secureCookies(),
    path: '/',
    maxAge: LIFETIME_SECONDS,
  }) as const
