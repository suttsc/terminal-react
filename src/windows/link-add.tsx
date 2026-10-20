'use client'

import { useId, useState } from 'react'
import type { FormEvent, ReactNode } from 'react'
import { routes } from '@/routes'
import type { LinkView as Link } from '@/services/link-view'

export type LinkAddWindowProps = {
  categories: string[]
}

type LinkForm = {
  url: string
  author: string
  category: string
  reason: string
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: (id: string) => ReactNode
}) {
  const id = useId()

  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-xs text-ink-dim">
        {label}
      </label>
      {children(id)}
      {error && <p className="text-xs text-warn">{error}</p>}
    </div>
  )
}

const inputClass =
  'border-line bg-ground focus-visible:border-accent rounded-[5px] border px-2 py-1 outline-none'

export default function LinkAddWindow({ categories }: LinkAddWindowProps) {
  const blank: LinkForm = {
    url: '',
    author: '',
    category: categories[0] ?? '',
    reason: '',
  }
  const [data, setData] = useState<LinkForm>(blank)
  const [errors, setErrors] = useState<Partial<Record<keyof LinkForm, string>>>({})
  const [processing, setProcessing] = useState(false)
  const [shelved, setShelved] = useState<Link | null>(null)

  function set(field: keyof LinkForm, value: string) {
    setData((current) => ({ ...current, [field]: value }))
  }

  async function submit(event: FormEvent) {
    event.preventDefault()
    setProcessing(true)

    try {
      const response = await fetch(routes.storeLink, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
      const body = (await response.json()) as {
        data?: Link
        errors?: Partial<Record<keyof LinkForm, string>>
      }

      if (response.status === 201 && body.data) {
        setShelved(body.data)
        setErrors({})
        setData(blank)
      } else {
        setErrors(body.errors ?? {})
      }
    } catch {
      // The form stays as it was; trying again is the whole recovery plan.
    } finally {
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <Field label="url" error={errors.url}>
        {(id) => (
          <input
            id={id}
            type="url"
            required
            className={inputClass}
            value={data.url}
            onChange={(event) => set('url', event.target.value)}
          />
        )}
      </Field>
      <Field label="author" error={errors.author}>
        {(id) => (
          <input
            id={id}
            className={inputClass}
            value={data.author}
            onChange={(event) => set('author', event.target.value)}
          />
        )}
      </Field>
      <Field label="category" error={errors.category}>
        {(id) => (
          <select
            id={id}
            className={inputClass}
            value={data.category}
            onChange={(event) => set('category', event.target.value)}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        )}
      </Field>
      <Field label="reason" error={errors.reason}>
        {(id) => (
          <textarea
            id={id}
            required
            rows={3}
            className={inputClass}
            value={data.reason}
            onChange={(event) => set('reason', event.target.value)}
          />
        )}
      </Field>
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={processing}
          className="cursor-pointer rounded-[7px] border border-line bg-surface-2 px-3.5 py-2 font-mono text-xs text-ink hover:border-ink-faint disabled:opacity-45"
        >
          shelve
        </button>
        <p role="status" className="text-xs text-ink-dim">
          {shelved && `#${shelved.id} shelved. The title is on its way.`}
        </p>
      </div>
    </form>
  )
}
