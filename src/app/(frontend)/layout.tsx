import type { Metadata } from 'next'
import { Archivo, IBM_Plex_Mono } from 'next/font/google'
import { cookies, headers } from 'next/headers'
import type { ReactNode } from 'react'
import { getIsOwner } from '@/auth/auth'
import { FLASH_HEADER, openFlash } from '@/auth/flash'
import { THEME_COOKIE, themeOrDefault } from '@/lib/themes'
import Shell from '@/shell/shell'
import { site } from '@/site.config'
import { registry } from '@/terminal/registry'
import '@/styles/app.css'

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-archivo',
})

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
})

export const metadata: Metadata = {
  title: { template: '%s - suttsc', default: 'suttsc' },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

/**
 * Reads the theme, the session and any sign-in flash, then hands the shell the
 * manifest this visitor may see. Reads cookies; never sets one.
 */
export default async function RootLayout({ children }: { children: ReactNode }) {
  const [jar, requestHeaders, isOwner] = await Promise.all([cookies(), headers(), getIsOwner()])
  const theme = themeOrDefault(jar.get(THEME_COOKIE)?.value)
  const [flash, answers] = await Promise.all([
    openFlash(requestHeaders.get(FLASH_HEADER)),
    registry.answers({ isOwner }),
  ])

  return (
    <html
      lang="en-GB"
      data-theme={theme}
      className={`${archivo.variable} ${plexMono.variable}`}
      // The theme menu repaints this attribute live while previewing.
      suppressHydrationWarning
    >
      <body className="font-sans text-ink antialiased">
        <Shell
          commands={registry.manifest({ isOwner })}
          answers={answers}
          theme={theme}
          ownerTimezone={site.timezone}
          flash={{
            signedIn: flash !== null && 'signedIn' in flash,
            rejection: flash !== null && 'rejection' in flash ? flash.rejection : undefined,
          }}
        >
          {children}
        </Shell>
      </body>
    </html>
  )
}
