'use client'

import { useId } from 'react'
import type { ReactNode } from 'react'

export const textareaClass =
  'border-line bg-ground focus-visible:border-accent w-full rounded-[5px] border px-2 py-1 font-mono outline-none'

export function ToolField({
  label,
  children,
}: {
  label: string
  children: (id: string) => ReactNode
}) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-ink-dim">
        {label}
      </label>
      {children(id)}
    </div>
  )
}

export function Output({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1">
      <p className="text-xs text-ink-dim">{label}</p>
      <output className="block max-h-48 overflow-auto rounded-[5px] border border-line bg-ground px-2 py-1 break-all whitespace-pre-wrap">
        {value || ' '}
      </output>
    </div>
  )
}
