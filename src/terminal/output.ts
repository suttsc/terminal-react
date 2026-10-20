import type { ComponentProps } from 'react'
import { routes } from '@/routes'
import type { RouteName } from '@/routes'
import type { windows } from '@/windows/registry'

/**
 * What running a command usually does, shown as a badge in the palette.
 */
export type Outcome = 'inline' | 'menu' | 'window' | 'navigate'

export type MenuItem = {
  label: string
  hint: string
  /** The command to execute when the item is picked. */
  run: string
  /** What picking it does, for the badge; null shows no badge. */
  outcome: Outcome | null
}

export type InlineOutput = { type: 'inline'; lines: string[] }

export type MenuOutput = { type: 'menu'; label: string; items: MenuItem[] }

export type WindowKey = keyof typeof windows

export type WindowProps<K extends WindowKey> = ComponentProps<(typeof windows)[K]>

export type WindowOutput = {
  type: 'window'
  title: string
  component: WindowKey
  props: Record<string, unknown>
}

export type NavigateOutput = { type: 'navigate'; url: string }

export type Output = InlineOutput | MenuOutput | WindowOutput | NavigateOutput

export const inline = (lines: string[]): InlineOutput => ({ type: 'inline', lines })

export const menu = (label: string, items: MenuItem[]): MenuOutput => ({
  type: 'menu',
  label,
  items,
})

export const menuItem = (
  label: string,
  hint: string,
  run: string,
  outcome: Outcome | null = null,
): MenuItem => ({ label, hint, run, outcome })

/**
 * A window drawn by the component registered under `component`; its props are
 * checked against that component, so a typo fails tsc.
 */
export function window<K extends WindowKey>(
  title: string,
  component: K,
  ...rest: Partial<WindowProps<K>> extends WindowProps<K>
    ? [props?: WindowProps<K>]
    : [props: WindowProps<K>]
): WindowOutput {
  return {
    type: 'window',
    title,
    component,
    props: { ...(rest[0] as Record<string, unknown> | undefined) },
  }
}

/**
 * Go to a named route. Never a free URL.
 */
export const navigate = (route: RouteName): NavigateOutput => ({
  type: 'navigate',
  url: routes[route],
})
