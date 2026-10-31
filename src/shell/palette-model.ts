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

/** What Esc (or its button, on a touchscreen) does right now. */
export type EscapeAction = 'clear' | 'back' | 'close'

/**
 * Esc clears what was typed, then puts the command list back, then closes a
 * summoned palette. On the homepage with nothing to undo, it does nothing.
 */
export function escapeAction({
  query,
  hasOutput,
  open,
}: {
  query: string
  hasOutput: boolean
  open: boolean
}): EscapeAction | null {
  if (query !== '') {
    return 'clear'
  }

  if (hasOutput) {
    return 'back'
  }

  return open ? 'close' : null
}

export type PaletteFooter = {
  left: string
  right: string
  /** The left hint for a touchscreen, where there are no keys to mention. */
  touch: string
}

/**
 * The hints along the bottom of the palette.
 */
export function paletteFooter(
  view: PaletteView,
  { previewing, waiting }: { previewing?: string; waiting: boolean },
): PaletteFooter {
  const { menu, inline, asking, typed, isThemeMenu, options } = view
  let footer: PaletteFooter

  if (menu) {
    const previewNote = previewing ? ` · previewing ${previewing}` : ''

    footer = {
      left: `1–${Math.min(options.length, 9)} to pick${previewNote}`,
      right: isThemeMenu ? '↵ keep · esc revert' : 'esc back',
      touch: `tap to pick${previewNote}`,
    }
  } else if (inline) {
    footer = { left: 'esc to clear', right: '', touch: 'back for the commands' }
  } else if (asking) {
    footer = { left: 'nothing matched', right: '↵ ask', touch: 'nothing matched' }
  } else {
    const count = `${options.length} result${options.length === 1 ? '' : 's'}`

    footer = {
      left: typed === '' ? 'type / for commands' : count,
      right: '↑↓ move   ↵ run',
      touch: typed === '' ? 'tap a command' : count,
    }
  }

  return waiting ? { ...footer, left: 'working…', touch: 'working…' } : footer
}
