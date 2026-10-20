'use client'

import { useShell } from '@/shell/shell-context'

export type NiceTryWindowProps = {
  name: string | null
  email: string | null
}

function initials(name: string | null, email: string | null): string {
  const source = name ?? email ?? '?'

  return source
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join('')
}

/**
 * A rejected sign-in, shown to its owner once. Nothing here came from storage
 * and nothing here goes back to it.
 */
export default function NiceTryWindow({ name, email }: NiceTryWindowProps) {
  const shell = useShell()
  const self = shell.windows.find((open) => open.component === 'nice-try')

  return (
    <div className="flex flex-col">
      <h3 className="mb-2.5 text-[15px] font-semibold text-ink">
        Authentication succeeded. Identity did not.
      </h3>
      <div className="mb-3.5 flex items-center gap-3 rounded-lg border border-line-soft bg-ground p-3">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-line bg-surface-3 font-mono text-xs text-ink"
        >
          {initials(name, email)}
        </span>
        <div className="min-w-0">
          <p className="truncate leading-[1.3] text-ink">{name ?? 'Someone'}</p>
          {email && <p className="truncate font-mono text-[11.5px] text-ink-faint">{email}</p>}
        </div>
        <span className="ml-auto shrink-0 rounded border border-warn-line px-[7px] py-[3px] font-mono text-[9.5px] tracking-[0.1em] text-warn uppercase">
          not suttsc
        </span>
      </div>
      <p>Google vouches for you. It just doesn't vouch for you being suttsc.</p>
      <div className="mt-3.5 flex items-center justify-between gap-3 border-t border-line-soft pt-3.5">
        <span className="font-mono text-[11px] text-ink-faint">nothing about you was kept</span>
        <button
          type="button"
          className="cursor-pointer rounded-[7px] border border-line bg-surface-2 px-3.5 py-2 font-mono text-xs text-ink hover:border-ink-faint"
          onClick={() => self && shell.closeWindow(self.id)}
        >
          sign out
        </button>
      </div>
    </div>
  )
}
