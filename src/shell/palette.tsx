'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type { KeyboardEvent as ReactKeyboardEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import Badge, { ThemeSwatch } from '@/shell/badge'
import { isEditable } from '@/shell/editable'
import InlineLines from '@/shell/inline-lines'
import { hasArguments, normalise } from '@/shell/match-commands'
import { paletteFooter, paletteView } from '@/shell/palette-model'
import { useShell } from '@/shell/shell-context'
import type { MenuItem } from '@/terminal/output'

/**
 * The typed prefix of a command name, lit in the accent.
 */
function Highlighted({ name, typed }: { name: string; typed: string }) {
  const prefix = normalise(typed)

  if (typed === '' || !name.startsWith(prefix)) {
    return name
  }

  return (
    <>
      <span className="text-accent">{prefix}</span>
      {name.slice(prefix.length)}
    </>
  )
}

// Fast answers shouldn't flash a busy state; only a wait you'd notice shows one.
const BUSY_AFTER_MS = 150

/**
 * True once the shell has been waiting on the server for a noticeable moment.
 */
function useNoticeablyBusy(busy: boolean): boolean {
  const [noticeable, setNoticeable] = useState(false)

  useEffect(() => {
    if (!busy) {
      return
    }

    const timer = setTimeout(() => setNoticeable(true), BUSY_AFTER_MS)

    return () => {
      clearTimeout(timer)
      setNoticeable(false)
    }
  }, [busy])

  return busy && noticeable
}

function Key({ children }: { children: ReactNode }) {
  return (
    <span className="shrink-0 rounded-[5px] border border-line px-1.5 py-[3px] font-mono text-[10.5px] text-ink-faint max-sm:hidden">
      {children}
    </span>
  )
}

export default function Palette() {
  const shell = useShell()
  const waiting = useNoticeablyBusy(shell.busy)
  const { commands, theme } = shell
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listboxRef = useRef<HTMLUListElement>(null)
  const keptTheme = useRef<string | null>(null)
  const listboxId = useId()

  const visible = shell.isHome || shell.open
  const view = paletteView({ commands, output: shell.output, query })
  const { typed, menu, inline, isThemeMenu, options, section, asking } = view
  const hasOptions = options.length > 0
  const activeIndex = Math.max(0, Math.min(selected, options.length - 1))
  const activeOption: MenuItem | undefined = options[activeIndex]
  const optionId = (index: number) => `${listboxId}-option-${index}`
  const previewing = isThemeMenu ? activeOption?.label : undefined

  useEffect(() => {
    if (visible) {
      inputRef.current?.focus()
    }
  }, [visible])

  useEffect(() => {
    listboxRef.current
      ?.querySelector('[aria-selected="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, section])

  // Previewing a theme repaints everything; leaving the menu puts back whatever is kept.
  useEffect(() => {
    if (previewing === undefined) {
      return
    }

    document.documentElement.dataset.theme = previewing

    return () => {
      document.documentElement.dataset.theme = keptTheme.current ?? theme
    }
  }, [previewing, theme])

  useEffect(() => {
    function summonFromAnywhere(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()

        if (shell.open) {
          shell.dismiss()
        } else {
          shell.summon()
          inputRef.current?.focus()
        }

        return
      }

      const unmodified = !event.metaKey && !event.ctrlKey && !event.altKey

      if (!unmodified || isEditable(event.target)) {
        return
      }

      if (event.key === '/') {
        event.preventDefault()
        updateQuery('/')
        shell.summon()
        inputRef.current?.focus()
      } else if (event.key === 't' || event.key === 'T') {
        event.preventDefault()
        shell.run('/theme')
      }
    }

    document.addEventListener('keydown', summonFromAnywhere)

    return () => document.removeEventListener('keydown', summonFromAnywhere)
  })

  function updateQuery(value: string) {
    setQuery(value)
    setSelected(0)
  }

  function execute(option: MenuItem) {
    keptTheme.current = isThemeMenu ? option.label : null
    // Keep whatever was typed after the signature, so "/theme amber" arrives whole.
    shell.run(!menu && hasArguments(typed, option.run) ? typed : option.run)
    updateQuery('')
  }

  function back() {
    keptTheme.current = null
    updateQuery('')
    shell.clear()
  }

  function handleKeyDown(event: ReactKeyboardEvent<HTMLInputElement>) {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        if (!hasOptions) {
          return
        }

        event.preventDefault()
        const step = event.key === 'ArrowDown' ? 1 : -1
        setSelected((activeIndex + step + options.length) % options.length)

        return
      }
      case 'Enter':
        event.preventDefault()

        if (activeOption) {
          execute(activeOption)
        }

        return
      case 'Tab': {
        const completion = !menu && view.matched && activeOption ? `${activeOption.run} ` : null

        if (completion && !query.startsWith(completion)) {
          event.preventDefault()
          updateQuery(completion)
        } else if (shell.open) {
          // The input is the only stop in the dialog, so focus stays put.
          event.preventDefault()
        }

        return
      }
      case 'Escape':
        if (query !== '') {
          updateQuery('')
        } else if (shell.output !== null) {
          back()
        } else {
          shell.dismiss()
        }

        return
      default: {
        const pick =
          menu && typed === '' && /^[1-9]$/.test(event.key)
            ? options[Number(event.key) - 1]
            : undefined

        if (pick) {
          event.preventDefault()
          execute(pick)
        }
      }
    }
  }

  if (!visible) {
    return null
  }

  const footer = paletteFooter(view, { previewing, waiting })

  return (
    <div
      className={cn(
        'fixed inset-x-0 top-0 z-40 flex justify-center px-4 pt-[24vh] max-sm:pt-[12vh]',
        shell.open && 'bottom-0 z-[1000] bg-ground/70',
      )}
      onMouseDown={(event) => {
        if (shell.open && event.target === event.currentTarget) {
          shell.dismiss()
        }
      }}
    >
      <div
        className="h-fit w-[min(620px,calc(100vw-32px))] overflow-hidden rounded-xl border border-line bg-palette-glass shadow-(--shadow-palette) backdrop-blur-[20px] motion-safe:animate-pop"
        {...(shell.open && {
          role: 'dialog',
          'aria-modal': true,
          'aria-label': 'Command palette',
        })}
      >
        {shell.isHome && <h1 className="sr-only">suttsc</h1>}

        <div className="flex h-14 items-center gap-3 border-b border-line-soft px-4">
          <span
            aria-hidden="true"
            className={cn('font-mono text-sm text-accent', waiting && 'motion-safe:animate-pulse')}
          >
            ›
          </span>
          {menu && shell.outputCommand && (
            <span className="shrink-0 rounded-[5px] border border-line bg-surface-2 px-2 py-[3px] font-mono text-xs text-ink-dim">
              {shell.outputCommand}
            </span>
          )}
          <input
            ref={inputRef}
            role="combobox"
            aria-label={menu ? `Filter ${menu.label}` : 'Search suttsc'}
            aria-expanded={hasOptions}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={hasOptions ? optionId(activeIndex) : undefined}
            aria-busy={shell.busy}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder={menu ? `filter ${menu.label}…` : 'Search suttsc…'}
            className="min-w-0 flex-1 bg-transparent font-mono text-[15px] tracking-[-0.01em] text-ink caret-accent outline-none placeholder:text-ink-faint"
            value={query}
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={handleKeyDown}
          />
          <Key>esc</Key>
        </div>

        <div hidden={!hasOptions}>
          <p
            aria-hidden="true"
            className="px-4 pt-3.5 pb-1.5 font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase"
          >
            {section}
          </p>
          <ul
            ref={listboxRef}
            role="listbox"
            id={listboxId}
            aria-label={section}
            className="max-h-[44vh] overflow-y-auto pb-1.5"
          >
            {options.map((option, index) => (
              <li
                key={option.run}
                id={optionId(index)}
                role="option"
                aria-selected={index === activeIndex}
                className="group flex cursor-default items-center gap-3 border-l-2 border-transparent py-[9px] pr-4 pl-3.5 aria-selected:border-l-accent aria-selected:bg-surface-2 pointer-coarse:min-h-11"
                // Keeps focus in the input so aria-activedescendant stays valid.
                onMouseDown={(event) => event.preventDefault()}
                onMouseMove={() => setSelected(index)}
                onClick={() => execute(option)}
              >
                <span
                  aria-hidden="true"
                  className="w-4 shrink-0 text-center font-mono text-[11px] text-ink-faint group-aria-selected:text-accent"
                >
                  {index + 1}
                </span>
                <span
                  className={cn(
                    'shrink-0 font-mono text-[13.5px] text-ink',
                    menu && 'w-24 truncate',
                  )}
                >
                  {menu || asking ? (
                    option.label
                  ) : (
                    <Highlighted name={option.label} typed={typed} />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink-dim">
                  {option.hint}
                </span>
                {isThemeMenu ? (
                  <ThemeSwatch theme={option.label} />
                ) : (
                  option.outcome && <Badge outcome={option.outcome} />
                )}
              </li>
            ))}
          </ul>
        </div>

        <div role="status" className="empty:hidden">
          {inline && (
            <div className="pt-3.5 pr-4 pb-4 pl-[34px]">
              <InlineLines lines={inline.lines} />
            </div>
          )}
        </div>

        <div className="flex justify-between gap-4 border-t border-line-soft px-3.5 py-2 font-mono text-[10.5px] tracking-[0.02em] text-ink-faint">
          <span className="truncate">{footer.left}</span>
          <span className="shrink-0 whitespace-pre max-sm:hidden">{footer.right}</span>
        </div>
      </div>
    </div>
  )
}
