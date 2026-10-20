'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import { routes } from '@/routes'
import { isEditable } from '@/shell/editable'
import Clock from '@/shell/clock'
import { useShell } from '@/shell/shell-context'

/**
 * Whether this tab has a page on this site to go back to. The browser's own
 * history also holds whatever came before the site, so count visits here.
 */
function useCanGoBack(): boolean {
  const path = usePathname()
  const current = useRef(path)
  const popped = useRef(false)
  const [depth, setDepth] = useState(0)

  useEffect(() => {
    const notePop = () => {
      popped.current = true
    }

    window.addEventListener('popstate', notePop)

    return () => window.removeEventListener('popstate', notePop)
  }, [])

  useEffect(() => {
    if (path !== current.current) {
      current.current = path
      const back = popped.current
      // A history pop is treated as a step back; anything else as a step forward.
      setDepth((steps) => (back ? Math.max(0, steps - 1) : steps + 1))
    }

    popped.current = false
  }, [path])

  return depth > 0
}

const neverChanges = () => () => {}

/** The palette's shortcut as this keyboard spells it. */
const summonShortcut = (): string =>
  /Mac|iPhone|iPad/.test(navigator.userAgent) ? '⌘ + k' : 'ctrl + k'

// The server can't see the keyboard, so it guesses the commoner one.
const defaultShortcut = () => 'ctrl + k'

export default function Taskbar() {
  const { windows, focusWindow, isHome, open, summon } = useShell()
  const minimised = windows.filter((open) => open.minimised)
  const canGoBack = useCanGoBack()
  const shortcut = useSyncExternalStore(neverChanges, summonShortcut, defaultShortcut)

  useEffect(() => {
    function backFromAnywhere(event: KeyboardEvent) {
      // Left alone in text fields, where Option+← jumps a word on a Mac.
      if (
        canGoBack &&
        event.altKey &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.shiftKey &&
        event.key === 'ArrowLeft' &&
        !isEditable(event.target)
      ) {
        event.preventDefault()
        window.history.back()
      }
    }

    document.addEventListener('keydown', backFromAnywhere)

    return () => document.removeEventListener('keydown', backFromAnywhere)
  }, [canGoBack])

  return (
    <nav
      aria-label="Taskbar"
      className="fixed inset-x-0 bottom-0 z-[999] flex h-11 items-center gap-1.5 border-t border-line bg-taskbar-glass px-3 backdrop-blur-[18px]"
    >
      <Link
        href={routes.home}
        aria-label="suttsc, home"
        className="rounded-[7px] px-2.5 py-1.5 font-mono text-[13px] font-medium tracking-[-0.01em] text-ink hover:bg-surface-2 pointer-coarse:min-h-11 pointer-coarse:content-center"
      >
        sutts<span className="text-accent">c</span>
      </Link>
      {canGoBack && (
        <button
          type="button"
          aria-label="Back"
          aria-keyshortcuts="Alt+ArrowLeft"
          className="cursor-pointer rounded-[7px] px-2.5 py-1.5 font-mono text-xs text-ink-dim hover:bg-surface-2 hover:text-ink pointer-coarse:min-h-11"
          onClick={() => window.history.back()}
        >
          ←<span className="max-sm:hidden"> back</span>
          <span className="text-ink-faint max-sm:hidden pointer-coarse:hidden"> (alt + ←)</span>
        </button>
      )}
      {!isHome && !open && (
        <button
          type="button"
          aria-label="Open the terminal"
          aria-keyshortcuts="Control+K Meta+K"
          className="cursor-pointer rounded-[7px] px-2.5 py-1.5 font-mono text-xs text-ink-dim hover:bg-surface-2 hover:text-ink pointer-coarse:min-h-11"
          onClick={summon}
        >
          <span className="text-accent">›</span>
          <span className="max-sm:hidden"> terminal</span>
          <span className="text-ink-faint max-sm:hidden pointer-coarse:hidden"> ({shortcut})</span>
        </button>
      )}
      <ul className="flex min-w-0 flex-1 justify-center gap-1.5">
        {minimised.map((open) => (
          <li key={open.id} className="min-w-0">
            <button
              type="button"
              className="block max-w-[180px] cursor-pointer truncate rounded-[7px] border border-line-soft bg-surface-2 px-[11px] py-[5px] font-mono text-[11.5px] text-ink-dim hover:border-line hover:text-ink"
              onClick={() => focusWindow(open.id)}
            >
              {open.title}
            </button>
          </li>
        ))}
      </ul>
      <Clock />
    </nav>
  )
}
