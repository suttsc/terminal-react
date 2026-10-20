import type { ManifestEntry as CommandManifestEntry } from '@/terminal/types'

export function normalise(query: string): string {
  const typed = query.trim().toLowerCase().replace(/\s+/g, ' ')

  return typed.startsWith('/') ? typed : `/${typed}`
}

/**
 * Whether the query is a signature followed by arguments, as in "/theme amber".
 */
export function hasArguments(query: string, signature: string): boolean {
  return normalise(query).startsWith(`${signature} `)
}

function rank(signature: string, typed: string): number {
  if (typed === signature || typed.startsWith(`${signature} `)) {
    return 0
  }

  if (signature.startsWith(typed)) {
    return 1
  }

  return signature.includes(typed.slice(1)) ? 2 : -1
}

export function matchCommands(
  commands: CommandManifestEntry[],
  query: string,
): CommandManifestEntry[] {
  const typed = normalise(query)

  return commands
    .map((command) => ({ command, score: rank(command.signature, typed) }))
    .filter(({ score }) => score >= 0)
    .sort(
      (a, b) =>
        a.score - b.score ||
        // "/link add" outranks "/link" when both are typed in full.
        (a.score === 0 ? b.command.signature.length - a.command.signature.length : 0),
    )
    .map(({ command }) => command)
}
