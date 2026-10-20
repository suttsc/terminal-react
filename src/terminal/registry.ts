import { commands } from '@/terminal/commands'
import type { Output } from '@/terminal/output'
import type {
  AuthorizationContext,
  CommandContext,
  ManifestEntry,
  TerminalCommand,
} from '@/terminal/types'

export class CommandNotFound extends Error {
  constructor(input: string) {
    super(`No command matches [${input}].`)
    this.name = 'CommandNotFound'
  }
}

export type RunContext = Omit<CommandContext, 'args' | 'arg' | 'manifest'>

export type Registry = {
  manifest(ctx: AuthorizationContext): ManifestEntry[]
  run(input: string, ctx: RunContext): Promise<Output>
}

const words = (input: string): string[] =>
  input
    .trim()
    .replace(/^\/+/, '')
    .split(/\s+/)
    .filter((word) => word !== '')

export function createRegistry(list: TerminalCommand[]): Registry {
  const sorted = [...list].sort((a, b) =>
    a.signature < b.signature ? -1 : a.signature > b.signature ? 1 : 0,
  )

  function manifest(ctx: AuthorizationContext): ManifestEntry[] {
    return sorted
      .filter((command) => command.authorized(ctx) && !command.hidden)
      .map(({ signature, description, outcome }) => ({ signature, description, outcome }))
  }

  /**
   * The command with the longest signature the typed words begin with, so
   * "/link add" wins over "/link".
   */
  function match(typedWords: string[]): TerminalCommand | null {
    const typed = `/${typedWords.join(' ')}`.toLowerCase()
    let found: TerminalCommand | null = null

    for (const command of sorted) {
      const matches = typed === command.signature || typed.startsWith(`${command.signature} `)

      if (matches && command.signature.length > (found?.signature.length ?? 0)) {
        found = command
      }
    }

    return found
  }

  async function run(input: string, ctx: RunContext): Promise<Output> {
    const typedWords = words(input)
    const command = match(typedWords)

    // An unauthorised command answers exactly as a missing one would.
    if (command === null || !command.authorized(ctx)) {
      throw new CommandNotFound(input)
    }

    const args = typedWords.slice(command.signature.split(' ').length)

    return command.handle({
      ...ctx,
      args,
      arg: (position) => args[position],
      manifest: () => manifest(ctx),
    })
  }

  return { manifest, run }
}

export const registry = createRegistry(commands)
