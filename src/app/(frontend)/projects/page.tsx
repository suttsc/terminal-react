import type { Metadata } from 'next'
import { listProjects } from '@/repositories/pages'
import Page, { Card } from '@/shell/page'

export const metadata: Metadata = { title: 'projects' }

export default async function Projects() {
  const projects = await listProjects()

  return (
    <Page
      eyebrow="/projects"
      title="Things I built on purpose"
      lede="Side projects, packages and one website that is currently pretending to be an operating system."
    >
      <div className="flex flex-col gap-2.5">
        {projects.map((project) => (
          <Card
            key={project.name}
            title={
              project.url ? (
                <a href={project.url} rel="noopener noreferrer" className="hover:text-accent">
                  {project.name}
                </a>
              ) : (
                project.name
              )
            }
            meta={project.stack}
          >
            {project.summary}
          </Card>
        ))}
      </div>
    </Page>
  )
}
