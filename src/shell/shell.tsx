'use client'

import type { ReactNode } from 'react'
import Desktop from '@/shell/desktop'
import Palette from '@/shell/palette'
import PixelField from '@/shell/pixel-field'
import ShellProvider from '@/shell/shell-provider'
import type { ShellProps } from '@/shell/shell-context'
import Taskbar from '@/shell/taskbar'

/**
 * The desktop every page sits on. Lives in the root layout, so windows and the
 * palette survive client-side navigation.
 */
export default function Shell({ children, ...props }: ShellProps & { children: ReactNode }) {
  return (
    <ShellProvider {...props}>
      <PixelField />
      <div className="min-h-screen pb-11">{children}</div>
      <Desktop />
      <Palette />
      <Taskbar />
    </ShellProvider>
  )
}
