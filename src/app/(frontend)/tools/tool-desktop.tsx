'use client'

import { useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import type { ToolEntry } from '@/lib/tools/registry'
import { useShell } from '@/shell/shell-context'

const iconClass =
  'group flex w-24 cursor-pointer flex-col items-center gap-2 rounded-[10px] p-2 text-center font-mono text-[11.5px] text-ink-dim hover:bg-surface-2 hover:text-ink focus-visible:bg-surface-2'

function Glyph({ glyph }: { glyph: string }) {
  return (
    <span
      aria-hidden="true"
      className="flex size-14 items-center justify-center rounded-md border border-line bg-surface text-lg text-accent shadow-(--shadow-window) group-hover:border-accent group-focus-visible:border-accent"
    >
      {glyph}
    </span>
  )
}

/**
 * A desktop of icons. One click opens a tool in a window; arrow keys move between icons.
 */
export default function ToolDesktop({ tools }: { tools: ToolEntry[] }) {
  const shell = useShell()
  const [focused, setFocused] = useState(0)
  const icons = useRef<(HTMLElement | null)[]>([])

  function open(tool: ToolEntry) {
    if (tool.component === null) {
      return
    }

    shell.openWindow({
      title: tool.label,
      component: tool.component,
      props: {},
      wide: tool.wide,
    })
  }

  function move(event: KeyboardEvent<HTMLUListElement>) {
    const steps: Record<string, number> = {
      ArrowRight: 1,
      ArrowDown: 1,
      ArrowLeft: -1,
      ArrowUp: -1,
    }
    let next: number | null = null

    if (event.key in steps) {
      next = (focused + (steps[event.key] ?? 0) + tools.length) % tools.length
    } else if (event.key === 'Home') {
      next = 0
    } else if (event.key === 'End') {
      next = tools.length - 1
    }

    if (next !== null) {
      event.preventDefault()
      setFocused(next)
      icons.current[next]?.focus()
    }
  }

  return (
    <>
      <main className="px-6 pt-10">
        <h1 className="sr-only">Tools</h1>
        <ul aria-label="Tools" className="flex flex-wrap gap-4" onKeyDown={move}>
          {tools.map((tool, index) => {
            const shared = {
              ref: (element: HTMLElement | null) => {
                icons.current[index] = element
              },
              tabIndex: index === focused ? 0 : -1,
              title: tool.description,
              className: iconClass,
              onFocus: () => setFocused(index),
            }

            return (
              <li key={tool.slug}>
                {tool.href ? (
                  <a {...shared} href={tool.href} rel="noopener noreferrer">
                    <Glyph glyph={tool.glyph} />
                    <span>{tool.label}</span>
                  </a>
                ) : (
                  <button {...shared} type="button" onClick={() => open(tool)}>
                    <Glyph glyph={tool.glyph} />
                    <span>{tool.label}</span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </main>
      <p className="fixed bottom-[60px] left-1/2 z-30 -translate-x-1/2 rounded-[10px] border border-line bg-palette-glass px-4 py-2 text-center font-mono text-[11.5px] text-ink-dim shadow-(--shadow-window) backdrop-blur-[18px] max-sm:w-[calc(100vw-2rem)]">
        No cookies. No ads. Nothing typed here leaves your browser.
      </p>
    </>
  )
}
