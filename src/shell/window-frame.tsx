'use client'

import { useEffect, useId, useRef, useState } from 'react'
import type {
  KeyboardEvent as ReactKeyboardEvent,
  PointerEvent as ReactPointerEvent,
  ReactNode,
} from 'react'
import { cn } from '@/lib/utils'
import { useShell } from '@/shell/shell-context'
import type { OpenWindow } from '@/shell/shell-context'

const WIDTH = 460
const WIDE = 860
const CASCADE = 26
const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function startingPosition(id: number, width: number) {
  const offset = (id % 6) * CASCADE

  return {
    x: Math.max(16, window.innerWidth / 2 - width / 2) + offset,
    y: 110 + offset,
  }
}

function Control({
  label,
  tone,
  onClick,
  children,
}: {
  label: string
  tone: 'hide' | 'close'
  onClick: () => void
  children: string
}) {
  return (
    // The hit area is 44px on touch; the drawn key stays small inside it.
    <button
      type="button"
      aria-label={label}
      className="group/control flex cursor-pointer items-center justify-center outline-none pointer-coarse:size-11"
      onClick={onClick}
    >
      <span
        className={
          tone === 'close'
            ? 'rounded-[5px] border border-line px-[7px] py-0.5 font-mono text-[10.5px] leading-[1.4] text-ink-dim outline-offset-2 group-hover/control:border-warn-line group-hover/control:text-warn group-focus-visible/control:outline-2 group-focus-visible/control:outline-accent'
            : 'rounded-[5px] border border-line px-[7px] py-0.5 font-mono text-[10.5px] leading-[1.4] text-ink-dim outline-offset-2 group-hover/control:border-ink-faint group-hover/control:text-ink group-focus-visible/control:outline-2 group-focus-visible/control:outline-accent'
        }
      >
        {children}
      </span>
    </button>
  )
}

type WindowFrameProps = {
  window: OpenWindow
  children: ReactNode
}

/**
 * Drag, focus, close, minimise. Nothing else until something needs it.
 */
export default function WindowFrame({ window: frame, children }: WindowFrameProps) {
  const shell = useShell()
  const titleId = useId()
  const ref = useRef<HTMLDivElement>(null)
  const returnFocusTo = useRef<HTMLElement | null>(null)
  const drag = useRef<{ dx: number; dy: number } | null>(null)
  const [position, setPosition] = useState(() =>
    startingPosition(frame.id, frame.wide ? WIDE : WIDTH),
  )

  // Take focus on open and on restore; hand it back on close.
  useEffect(() => {
    if (frame.minimised) {
      return
    }

    if (returnFocusTo.current === null) {
      returnFocusTo.current =
        document.activeElement instanceof HTMLElement ? document.activeElement : null
    }

    ref.current?.focus()
  }, [frame.minimised])

  useEffect(
    () => () => {
      if (returnFocusTo.current?.isConnected) {
        returnFocusTo.current.focus()
      }
    },
    [],
  )

  function trapFocus(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation()
      shell.closeWindow(frame.id)

      return
    }

    if (event.key !== 'Tab' || ref.current === null) {
      return
    }

    const focusable = [...ref.current.querySelectorAll<HTMLElement>(FOCUSABLE)]
    const first = focusable[0]
    const last = focusable[focusable.length - 1]

    if (first === undefined || last === undefined) {
      event.preventDefault()

      return
    }

    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  function startDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest('button')) {
      return
    }

    drag.current = {
      dx: event.clientX - position.x,
      dy: event.clientY - position.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function moveDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current === null) {
      return
    }

    setPosition({
      x: Math.min(Math.max(0, event.clientX - drag.current.dx), window.innerWidth - 80),
      y: Math.min(Math.max(0, event.clientY - drag.current.dy), window.innerHeight - 80),
    })
  }

  function minimise() {
    shell.minimiseWindow(frame.id)

    if (returnFocusTo.current?.isConnected) {
      returnFocusTo.current.focus()
    }
  }

  return (
    <div
      ref={ref}
      role="dialog"
      aria-labelledby={titleId}
      tabIndex={-1}
      hidden={frame.minimised}
      style={{
        left: position.x,
        top: position.y,
        zIndex: 45 + frame.layer,
      }}
      className={cn(
        'fixed flex max-h-[70vh] flex-col overflow-hidden rounded-[10px] border border-line bg-surface shadow-(--shadow-window) outline-none motion-safe:animate-pop max-sm:left-4!',
        frame.wide ? 'w-[min(860px,calc(100vw-2rem))]' : 'w-[min(460px,calc(100vw-2rem))]',
      )}
      onPointerDown={() => shell.focusWindow(frame.id)}
      onKeyDown={trapFocus}
    >
      <div
        className="flex h-[34px] shrink-0 cursor-grab touch-none items-center gap-2.5 border-b border-line-soft bg-surface-2 px-3 select-none active:cursor-grabbing pointer-coarse:h-11"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <h2
          id={titleId}
          className="truncate font-mono text-[11.5px] tracking-[0.02em] text-ink-dim"
        >
          {frame.title}
        </h2>
        <div className="ml-auto flex gap-1.5 pointer-coarse:-mr-1.5 pointer-coarse:gap-1">
          <Control label={`Minimise ${frame.title}`} tone="hide" onClick={minimise}>
            hide
          </Control>
          <Control
            label={`Close ${frame.title}`}
            tone="close"
            onClick={() => shell.closeWindow(frame.id)}
          >
            close
          </Control>
        </div>
      </div>
      <div className="overflow-y-auto p-[18px] text-[13.5px] leading-[1.7] text-ink-dim">
        {children}
      </div>
    </div>
  )
}
