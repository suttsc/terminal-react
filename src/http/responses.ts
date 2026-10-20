import type { ZodError } from 'zod'

/** A missing command, an unauthorised one and a visitor posting a link all look like this. */
export const notFound = () => Response.json({ message: 'Not found.' }, { status: 404 })

export const forbidden = () => Response.json({ message: 'Forbidden.' }, { status: 403 })

export const unauthorised = () => Response.json({ message: 'Unauthorised.' }, { status: 401 })

/** 422 with one message per field, the shape the forms render under each input. */
export function invalid(error: ZodError): Response {
  const errors: Record<string, string> = {}

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? 'form')
    errors[field] ??= issue.message
  }

  return Response.json({ message: Object.values(errors)[0], errors }, { status: 422 })
}
