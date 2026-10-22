import { matchCommands } from '@/shell/match-commands'
import type { InlineOutput, MenuItem, MenuOutput, Output } from '@/terminal/output'
import type { ManifestEntry } from '@/terminal/types'

export type PaletteView = {
  /** What was typed, trimmed. */
  typed: string
  /** The menu on show, if any; typing filters it. */
  menu: MenuOutput | null
  /** Inline output on show, only while nothing is typed. */
  inline: InlineOutput | null
  /** A menu of /theme choices, which previews as the selection moves. */
  isThemeMenu: boolean
  /** Whether what was typed matched a command, for Tab completion. */
  matched: boolean
  options: MenuItem[]
  /** The listbox's heading. */
  section: string
  /** Nothing matched, so the one option asks the question instead. */
  asking: boolean
}

const asItem = (command: ManifestEntry): MenuItem => ({
  label: command.signature,
  hint: command.description,
  run: command.signature,
  outcome: command.outcome,
})

/**
 * One listbox, four jobs: a menu (filtered as you type), every command at rest,
 * the commands matching what was typed, or asking when nothing does.
 */
export function paletteView({
  commands,
  output,
  query,
}: {
  commands: ManifestEntry[]
  output: Output | null
  query: string
}): PaletteView {
  const typed = query.trim()
  const menu = output?.type === 'menu' ? output : null
  const inline = typed === '' && output?.type === 'inline' ? output : null
  const isThemeMenu =
    menu !== null &&
    menu.items.length > 0 &&
    menu.items.every((item) => item.run.startsWith('/theme '))
  const matches = matchCommands(commands, typed).map(asItem)
  const view = { typed, menu, inline, isThemeMenu, matched: matches.length > 0, asking: false }

  if (menu) {
    const filter = typed.toLowerCase()

    return {
      ...view,
      options: menu.items.filter(
        (item) =>
          filter === '' ||
          item.label.toLowerCase().includes(filter) ||
          item.hint.toLowerCase().includes(filter),
      ),
      section: menu.label,
    }
  }

  if (inline) {
    return { ...view, options: [], section: '' }
  }

  if (typed === '') {
    return { ...view, options: commands.map(asItem), section: 'commands' }
  }

  if (matches.length > 0) {
    return { ...view, options: matches, section: 'commands' }
  }

  return {
    ...view,
    asking: true,
    options: [
      {
        label: 'Ask',
        hint: `“${typed}”`,
        run: `/ask ${typed.replace(/^\/+/, '')}`,
        outcome: 'inline',
      },
    ],
    section: 'no match',
  }
}

/**
 * The hints along the bottom of the palette.
 */
export function paletteFooter(
  view: PaletteView,
  { previewing, waiting }: { previewing?: string; waiting: boolean },
): { left: string; right: string } {
  const { menu, inline, asking, typed, isThemeMenu, options } = view
  let footer: { left: string; right: string }

  if (menu) {
    footer = {
      left: `1–${Math.min(options.length, 9)} to pick${previewing ? ` · previewing ${previewing}` : ''}`,
      right: isThemeMenu ? '↵ keep · esc revert' : 'esc back',
    }
  } else if (inline) {
    footer = { left: 'esc to clear', right: '' }
  } else if (asking) {
    footer = { left: 'nothing matched', right: '↵ ask' }
  } else {
    footer = {
      left:
        typed === ''
          ? 'type / for commands'
          : `${options.length} result${options.length === 1 ? '' : 's'}`,
      right: '↑↓ move   ↵ run',
    }
  }

  return waiting ? { ...footer, left: 'working…' } : footer
}
