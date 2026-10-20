import { isOwnerEmail } from '@/auth/owner-email'
import type { Flash } from '@/auth/flash'
import type { StatsRepository } from '@/repositories/types'

export type GoogleProfile = {
  name?: string | null
  email?: string | null
  email_verified?: boolean | null
}

/**
 * Let the owner in. Anyone else sees their own details for one render, then
 * they are gone; only the count survives. Returning a path refuses the sign-in
 * and sends the browser there with no session.
 */
export async function decideSignIn(
  profile: GoogleProfile | undefined,
  deps: { stats: StatsRepository; flash: (flash: Flash) => Promise<void> },
): Promise<true | string> {
  if (profile?.email_verified === true && isOwnerEmail(profile.email)) {
    await deps.flash({ signedIn: true })

    return true
  }

  await deps.stats.increment('niceTryCount')
  await deps.flash({
    rejection: { name: profile?.name ?? null, email: profile?.email ?? null },
  })

  return '/'
}
