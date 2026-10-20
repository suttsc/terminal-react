import type { Metadata } from 'next'
import Page from '@/shell/page'
import AboutWindow from '@/windows/about'

export const metadata: Metadata = { title: 'about' }

export default function About() {
  return (
    <Page eyebrow="/about" title="about.txt">
      <div className="text-[15px] leading-[1.7] text-ink-dim">
        <AboutWindow />
      </div>
    </Page>
  )
}
