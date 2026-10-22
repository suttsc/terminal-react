'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { routes } from '@/routes'
import { asSignature } from '@/shell/match-commands'
import { ShellContext } from '@/shell/shell-context'
import type { OpenWindow, ShellProps, WindowRequest } from '@/shell/shell-context'
import type { Output } from '@/terminal/output'

const NOT_FOUND = 'Nothing. suttsc has failed you.'
const FAILED = 'Something went wrong. It has not been reported.'

export default function ShellProvider({
  commands,
  answers,
  theme,
  ownerTimezone,
  flash,
  children,
}: ShellProps & { children: ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const isHome = path === '/'

  // A sign-in lands on a full page load, so its outcome seeds the shell's first state.
  const { rejection, signedIn } = flash

  // Remembering where the palette was summoned means any navigation closes it.
  const [summonedOn, setSummonedOn] = useState<string | null>(null)
  const [output, setOutput] = useState<Output | null>(() =>
    signedIn
      ? {
          type: 'inline',
          lines: ['Welcome back, suttsc.', "(This time it's true.)"],
        }
      : null,
  )
  const [outputCommand, setOutputCommand] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const returnFocusTo = useRef<HTMLElement | null>(null)
  const [windows, setWindows] = useState<OpenWindow[]>(() =>
    rejection
      ? [
          {
            id: 1,
            layer: 1,
            title: 'nice-try.txt',
            component: 'nice-try',
            props: rejection,
            minimised: false,
          },
        ]
      : [],
  )
  const [windowsShownOn, setWindowsShownOn] = useState(path)

  // A new page is what was asked for, so windows step aside to the taskbar rather than cover it.
  if (windowsShownOn !== path) {
    setWindowsShownOn(path)
    setWindows((current) => current.map((existing) => ({ ...existing, minimised: true })))
  }

  const nextWindowId = useRef(2)
  const nextLayer = useRef(2)

  const open = !isHome && summonedOn === path

  function summon() {
    if (isHome || open) {
      return
    }

    returnFocusTo.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSummonedOn(path)
  }

  function dismiss() {
    setSummonedOn(null)
    returnFocusTo.current?.focus()
    returnFocusTo.current = null
  }

  function show(result: Output, command: string) {
    switch (result.type) {
      case 'inline':
      case 'menu':
        setOutput(result)
        setOutputCommand(command.split(' ')[0] ?? command)
        summon()
        // Only a command that changed what the layout reads, such as the theme, asks for it again.
        if (result.refresh) {
          router.refresh()
        }

        return
      case 'navigate':
        setOutput(null)
        setSummonedOn(null)
        router.push(result.url)

        return
      case 'window':
        setOutput(null)
        setSummonedOn(null)
        openWindow(result)

        return
    }
  }

  function openWindow({ title, component, props, wide = false }: WindowRequest) {
    const id = nextWindowId.current++
    const layer = nextLayer.current++

    setWindows((current) => [
      ...current,
      { id, layer, title, component, props, minimised: false, wide },
    ])
  }

  function focusWindow(id: number) {
    const layer = nextLayer.current++

    // Stacking changes through layer alone, so windows never move in the DOM and keep focus.
    setWindows((current) =>
      current.map((existing) =>
        existing.id === id ? { ...existing, layer, minimised: false } : existing,
      ),
    )
  }

  function closeWindow(id: number) {
    setWindows((current) => current.filter((existing) => existing.id !== id))
  }

  function minimiseWindow(id: number) {
    setWindows((current) =>
      current.map((existing) => (existing.id === id ? { ...existing, minimised: true } : existing)),
    )
  }

  function fail(message: string) {
    setOutput({ type: 'inline', lines: [message] })
    setOutputCommand(null)
    summon()
  }

  async function run(command: string) {
    // Pure commands were answered when the page was rendered.
    const answer = answers[asSignature(command)]

    if (answer) {
      show(answer, command)

      return
    }

    setBusy(true)

    try {
      const response = await fetch(routes.terminal, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ command }),
      })

      if (!response.ok) {
        fail(response.status === 404 ? NOT_FOUND : FAILED)

        return
      }

      show((await response.json()) as Output, command)
    } catch {
      fail(FAILED)
    } finally {
      setBusy(false)
    }
  }

  return (
    <ShellContext
      value={{
        commands,
        answers,
        theme,
        ownerTimezone,
        output,
        outputCommand,
        isHome,
        open,
        busy,
        windows,
        run: (command) => void run(command),
        openWindow,
        summon,
        dismiss,
        clear: () => {
          setOutput(null)
          setOutputCommand(null)
        },
        focusWindow,
        closeWindow,
        minimiseWindow,
      }}
    >
      {children}
    </ShellContext>
  )
}
