import type { Outcome, Output } from '@/terminal/output'
import type { Repositories } from '@/repositories/types'

export type ManifestEntry = {
  signature: string
  description: string
  outcome: Outcome
}

/**
 * A small read/write view of the request's cookies. Signed values can't be
 * forged by the browser; the plain ones are not secrets.
 */
export type CookieJar = {
  get(name: string): string | undefined
  set(name: string, value: string, options?: { maxAge?: number }): void
  getSigned(name: string): string | undefined
  setSigned(name: string, value: string): void
}

export type SessionControls = {
  signOut(): Promise<void>
}

/**
 * Everything a command may touch, built per request so nothing request-scoped
 * lives in a module singleton.
 */
export type CommandContext = {
  isOwner: boolean
  /** The words typed after the signature, in their original case. */
  args: string[]
  arg(position: number): string | undefined
  cookies: CookieJar
  repos: Repositories
  session: SessionControls
  /** The commands this visitor may see, as the palette lists them. */
  manifest(): ManifestEntry[]
  now(): Date
}

export type AuthorizationContext = Pick<CommandContext, 'isOwner'>

export type TerminalCommand = {
  /** The text that summons the command, with its leading slash. */
  signature: string
  /** The line shown beside the signature in the palette. */
  description: string
  /** What running the command usually does, for the palette's badge. */
  outcome: Outcome
  /** Whether the command runs but is left out of the manifest. */
  hidden: boolean
  /**
   * Whether the command answers the same way every time for a given visitor,
   * reading nothing but `isOwner` and the manifest. Its answer ships with the
   * page, so the palette shows it without asking the server.
   */
  pure: boolean
  /**
   * Whether the command's answer also lives at /{name}, for anyone arriving
   * without the palette. Navigate commands have their own pages instead.
   */
  page: boolean
  /** Whether the current visitor may know the command exists at all. */
  authorized(ctx: AuthorizationContext): boolean
  handle(ctx: CommandContext): Promise<Output>
}

type Defaulted = 'hidden' | 'pure' | 'page' | 'authorized'

type CommandDefinition = Omit<TerminalCommand, Defaulted> &
  Partial<Pick<TerminalCommand, Defaulted>>

export function defineCommand(definition: CommandDefinition): TerminalCommand {
  return { hidden: false, pure: false, page: false, authorized: () => true, ...definition }
}

/**
 * A command that only exists for the signed-in owner. Everyone else gets a 404
 * and never sees it in the manifest.
 */
export function defineOwnerCommand(
  definition: Omit<CommandDefinition, 'authorized'>,
): TerminalCommand {
  return defineCommand({ ...definition, authorized: (ctx) => ctx.isOwner })
}
