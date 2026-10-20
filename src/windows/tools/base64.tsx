'use client'

import { useId, useState } from 'react'
import type { KeyboardEvent, ReactNode } from 'react'
import { decode, encode } from '@/lib/tools/base64'
import { textareaClass } from '@/windows/tools/field'

const paneClass = `${textareaClass} min-h-56 resize-y text-[13px] leading-[1.6]`

const actionClass =
  'bg-surface-2 border-line text-ink hover:border-accent hover:text-accent flex cursor-pointer items-center justify-center gap-1.5 rounded-[7px] border px-3 py-2 font-mono text-xs whitespace-nowrap'

/**
 * Ctrl+Enter, or ⌘+Enter on a Mac, runs the side you are typing in.
 */
function onSubmitKey(action: () => void) {
  return (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      action()
    }
  }
}

function Pane({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId()

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <label
        htmlFor={id}
        className="font-mono text-[10px] tracking-[0.16em] text-ink-faint uppercase"
      >
        {label}
      </label>
      {children(id)}
    </div>
  )
}

/**
 * Text on the left, base64 on the right. Decode, edit, encode again.
 */
export default function Base64Tool() {
  const [text, setText] = useState('')
  const [encoded, setEncoded] = useState('')
  const [urlSafe, setUrlSafe] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function runEncode() {
    setEncoded(encode(text, urlSafe))
    setError(null)
  }

  function runDecode() {
    const result = decode(encoded)

    if (result.ok) {
      setText(result.value)
      setError(null)
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="@container flex flex-col gap-3">
      <div className="grid gap-3 @xl:grid-cols-[1fr_auto_1fr] @xl:items-center">
        <Pane label="text">
          {(id) => (
            <textarea
              id={id}
              spellCheck={false}
              className={paneClass}
              value={text}
              onChange={(event) => setText(event.target.value)}
              onKeyDown={onSubmitKey(runEncode)}
            />
          )}
        </Pane>

        <div className="flex justify-center gap-2 @xl:flex-col">
          <button type="button" className={actionClass} onClick={runEncode}>
            encode
            <span aria-hidden="true" className="@xl:hidden">
              ↓
            </span>
            <span aria-hidden="true" className="hidden @xl:inline">
              →
            </span>
          </button>
          <button type="button" className={actionClass} onClick={runDecode}>
            <span aria-hidden="true" className="@xl:hidden">
              ↑
            </span>
            <span aria-hidden="true" className="hidden @xl:inline">
              ←
            </span>
            decode
          </button>
        </div>

        <Pane label="base64">
          {(id) => (
            <textarea
              id={id}
              spellCheck={false}
              className={paneClass}
              value={encoded}
              aria-invalid={error !== null}
              onChange={(event) => {
                setEncoded(event.target.value)
                setError(null)
              }}
              onKeyDown={onSubmitKey(runDecode)}
            />
          )}
        </Pane>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 font-mono text-[11px]">
        <label className="flex cursor-pointer items-center gap-1.5 text-ink-dim">
          <input
            type="checkbox"
            className="accent-accent"
            checked={urlSafe}
            onChange={(event) => setUrlSafe(event.target.checked)}
          />
          url-safe when encoding
        </label>
        <p role="status" className={error ? 'text-warn' : 'text-ink-faint'}>
          {error ?? 'ctrl + ↵ runs the side you are in'}
        </p>
      </div>
    </div>
  )
}
