'use client'

import { createContext, useContext } from 'react'
import type { Rejection } from '@/auth/flash'
import type { Theme } from '@/lib/themes'
import type { Output, WindowOutput } from '@/terminal/output'
import type { ManifestEntry } from '@/terminal/types'

export type OpenWindow = Omit<WindowOutput, 'type' | 'component'> & {
  component: string
  id: number
  /** Higher layers are drawn on top. */
  layer: number
  minimised: boolean
  /** Twice the usual width, for tools with side-by-side panes. */
  wide?: boolean
}

export type WindowRequest = Omit<OpenWindow, 'id' | 'layer' | 'minimised'>

/** What the root layout hands the shell on every render. */
export type ShellProps = {
  commands: ManifestEntry[]
  theme: Theme
  ownerTimezone: string
  /** A sign-in's outcome, for the first render after it and no other. */
  flash: { signedIn?: boolean; rejection?: Rejection }
}

export type Shell = Omit<ShellProps, 'flash'> & {
  /** The inline or menu output currently on show in the palette. */
  output: Output | null
  /** The command that produced it, for the palette's breadcrumb. */
  outputCommand: string | null
  isHome: boolean
  open: boolean
  busy: boolean
  /** Open windows, in the order they were opened. */
  windows: OpenWindow[]
  run: (command: string) => void
  /** Open a window without asking the server, for things that already know what to show. */
  openWindow: (window: WindowRequest) => void
  summon: () => void
  dismiss: () => void
  clear: () => void
  focusWindow: (id: number) => void
  closeWindow: (id: number) => void
  minimiseWindow: (id: number) => void
}

export const ShellContext = createContext<Shell | null>(null)

export function useShell(): Shell {
  const shell = useContext(ShellContext)

  if (shell === null) {
    throw new Error('useShell must be used inside the shell layout.')
  }

  return shell
}
