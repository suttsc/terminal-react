import { z } from 'zod'
import { CommandNotFound } from '@/terminal/registry'
import type { Registry, RunContext } from '@/terminal/registry'
import { forbidden, invalid, notFound } from '@/http/responses'
import { isSameOrigin } from '@/http/same-origin'

export const runCommandSchema = z.object({
  command: z
    .string({ error: 'The command field is required.' })
    .min(1, 'The command field is required.')
    .max(255, 'The command field must not be greater than 255 characters.'),
})

/**
 * POST /terminal: run whatever was typed into the palette.
 */
export function createTerminalHandler(deps: {
  registry: Registry
  context: () => Promise<RunContext>
}) {
  return async function POST(request: Request): Promise<Response> {
    if (!isSameOrigin(request)) {
      return forbidden()
    }

    const parsed = runCommandSchema.safeParse(await request.json().catch(() => ({})))

    if (!parsed.success) {
      return invalid(parsed.error)
    }

    try {
      return Response.json(await deps.registry.run(parsed.data.command, await deps.context()))
    } catch (error) {
      if (error instanceof CommandNotFound) {
        return notFound()
      }

      throw error
    }
  }
}
