'use client'

import { useShell } from '@/shell/shell-context'
import type { MenuItem } from '@/terminal/output'

/**
 * A menu output on its own page: each item runs through the palette.
 */
export default function CommandMenu({ items }: { items: MenuItem[] }) {
  const shell = useShell()

  return (
    <ol className="flex flex-col gap-1">
      {items.map((item) => (
        <li key={item.run} className="flex gap-3">
          <button
            type="button"
            className="cursor-pointer font-mono text-[13.5px] text-ink hover:text-accent"
            onClick={() => shell.run(item.run)}
          >
            {item.label}
          </button>
          <span className="text-ink-dim">{item.hint}</span>
        </li>
      ))}
    </ol>
  )
}
