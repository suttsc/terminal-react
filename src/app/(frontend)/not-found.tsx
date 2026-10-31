import type { Metadata } from 'next'
import { connection } from 'next/server'
import Page from '@/shell/page'

export const metadata: Metadata = { title: 'not found' }

export default async function NotFound() {
  // Rendered per request like every other page, so its scripts carry the CSP nonce.
  await connection()

  return (
    <Page
      eyebrow="404"
      title="Nothing. suttsc has failed you."
      lede="Type / for the things that do exist."
    />
  )
}
