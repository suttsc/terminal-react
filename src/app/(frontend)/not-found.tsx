import type { Metadata } from 'next'
import Page from '@/shell/page'

export const metadata: Metadata = { title: 'not found' }

export default function NotFound() {
  return (
    <Page
      eyebrow="404"
      title="Nothing. suttsc has failed you."
      lede="Type / for the things that do exist."
    />
  )
}
