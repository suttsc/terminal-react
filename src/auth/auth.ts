import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { cookies } from 'next/headers'
import { FLASH_COOKIE, flashCookieOptions, sealFlash } from '@/auth/flash'
import { decideSignIn } from '@/auth/sign-in'
import { payloadRepositories } from '@/repositories/payload'

declare module 'next-auth' {
  interface Session {
    owner?: boolean
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    owner?: boolean
  }
}

const THIRTY_DAYS = 30 * 24 * 60 * 60

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  session: { strategy: 'jwt', maxAge: THIRTY_DAYS },
  // A cancelled consent screen or a state mismatch goes home, quietly.
  pages: { signIn: '/auth/google', error: '/' },
  callbacks: {
    async signIn({ profile }) {
      const { stats } = await payloadRepositories()
      const jar = await cookies()

      return decideSignIn(profile, {
        stats,
        flash: async (flash) => {
          jar.set(FLASH_COOKIE, await sealFlash(flash), flashCookieOptions())
        },
      })
    },
    // The token says the owner is here and nothing else: no name, email or picture.
    jwt({ token, account }) {
      return { owner: account ? true : token.owner === true }
    },
    session({ session, token }) {
      return { expires: session.expires, owner: token.owner === true }
    },
  },
})

export async function getIsOwner(): Promise<boolean> {
  try {
    return (await auth())?.owner === true
  } catch {
    // No secret configured, or a cookie sealed with an old one: nobody is signed in.
    return false
  }
}
