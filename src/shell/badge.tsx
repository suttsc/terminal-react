import { cn } from '@/lib/utils'
import type { Outcome } from '@/terminal/output'

const tones: Record<Outcome, string> = {
  menu: 'text-ink-dim border-line',
  window: 'text-info border-info/30',
  navigate: 'text-ok border-ok/30',
  inline: 'text-accent border-accent/30',
}

/**
 * What picking a row will do: answer inline, open a menu or a window, or go somewhere.
 */
export default function Badge({ outcome }: { outcome: Outcome }) {
  return (
    <span
      className={cn(
        'shrink-0 rounded border px-[7px] py-[3px] font-mono text-[9.5px] tracking-[0.1em] uppercase',
        tones[outcome],
      )}
    >
      {outcome}
    </span>
  )
}

/**
 * A theme's ground, surface, accent and text, drawn from its own tokens.
 */
export function ThemeSwatch({ theme }: { theme: string }) {
  return (
    <span
      aria-hidden="true"
      data-theme={theme}
      className="flex shrink-0 gap-0.5 rounded border border-line p-[3px]"
    >
      <span className="size-2.5 bg-ground" />
      <span className="size-2.5 bg-surface-2" />
      <span className="size-2.5 bg-accent" />
      <span className="size-2.5 bg-ink" />
    </span>
  )
}
