import { z } from 'zod'
import { linkCategories } from '@/lib/link-categories'
import type { LinksRepository } from '@/repositories/types'
import { createLink } from '@/services/create-link'
import { toLinkView } from '@/services/link-view'
import { forbidden, invalid, notFound } from '@/http/responses'
import { isSameOrigin } from '@/http/same-origin'

const isHttpUrl = (value: string) => {
  try {
    const { protocol } = new URL(value)

    return protocol === 'http:' || protocol === 'https:'
  } catch {
    return false
  }
}

export const storeLinkSchema = z.object({
  url: z
    .string({ error: 'The url field is required.' })
    .trim()
    .min(1, 'The url field is required.')
    .max(2048, 'The url field must not be greater than 2048 characters.')
    .refine(isHttpUrl, 'The url field must be a valid URL.'),
  category: z.enum(linkCategories, { error: 'The selected category is invalid.' }),
  reason: z
    .string({ error: 'The reason field is required.' })
    .trim()
    .min(1, 'The reason field is required.')
    .max(1000, 'The reason field must not be greater than 1000 characters.'),
  author: z
    .string()
    .trim()
    .max(255, 'The author field must not be greater than 255 characters.')
    .nullish()
    .transform((author) => author || null),
})

/**
 * POST /api/links: the owner shelves a link from the /link add window.
 * Everyone else gets the same 404 as an unknown command.
 */
export function createStoreLinkHandler(deps: {
  isOwner: () => Promise<boolean>
  links: () => Promise<LinksRepository>
  scheduleTitleFetch: (id: number) => void
}) {
  return async function POST(request: Request): Promise<Response> {
    if (!(await deps.isOwner())) {
      return notFound()
    }

    if (!isSameOrigin(request)) {
      return forbidden()
    }

    const parsed = storeLinkSchema.safeParse(await request.json().catch(() => ({})))

    if (!parsed.success) {
      return invalid(parsed.error)
    }

    const link = await createLink(parsed.data, {
      links: await deps.links(),
      scheduleTitleFetch: deps.scheduleTitleFetch,
    })

    return Response.json({ data: toLinkView(link) }, { status: 201 })
  }
}
