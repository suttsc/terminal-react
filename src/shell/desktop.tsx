'use client'

import { useSyncExternalStore } from 'react'
import { useShell } from '@/shell/shell-context'
import WindowFrame from '@/shell/window-frame'
import { WindowBody } from '@/windows/registry'

const neverChanges = () => () => {}
const inBrowser = () => true
const onServer = () => false

/**
 * Windows are placed against the viewport, so they wait for the browser.
 */
export default function Desktop() {
  const { windows } = useShell()
  const mounted = useSyncExternalStore(neverChanges, inBrowser, onServer)

  if (!mounted) {
    return null
  }

  return windows.map((open) => (
    <WindowFrame key={open.id} window={open}>
      <WindowBody component={open.component} props={open.props} />
    </WindowFrame>
  ))
}
