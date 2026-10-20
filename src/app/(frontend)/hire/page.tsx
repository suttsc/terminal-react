import type { Metadata } from 'next'
import Page, { Card } from '@/shell/page'
import { site } from '@/site.config'

export const metadata: Metadata = { title: 'hire' }

export default function Hire() {
  const contactEmail = site.contactEmail

  return (
    <Page
      eyebrow="/hire"
      title="Availability: negotiable"
      lede="Enthusiasm: high. Notice period: standard. Opinions about service layers: several."
    >
      <Card
        title="What I'm interested in"
        meta={
          contactEmail && (
            <a href={`mailto:${contactEmail}`} className="text-info hover:underline">
              {contactEmail}
            </a>
          )
        }
      >
        <p>
          Teams where architecture is a shared conversation rather than something one person
          defends. Laravel shops that have outgrown the tutorial patterns and know it. Anything
          where I get to keep leading people as well as writing code.
        </p>
        <p className="mt-3">
          I use AI as a tool to enhance the work — more options explored, less time on boilerplate —
          while the decisions stay mine.
        </p>
      </Card>
    </Page>
  )
}
