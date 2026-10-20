import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type PageProps = {
  eyebrow: string
  title: string
  lede?: ReactNode
  /** Room for side-by-side panes; the text column stays readable either way. */
  wide?: boolean
  children?: ReactNode
}

/**
 * A real page behind the palette: eyebrow, heading, lede, then whatever it holds.
 * Its <title> and robots come from the route's metadata.
 */
export default function Page({ eyebrow, title, lede, wide = false, children }: PageProps) {
  return (
    <main className={cn('mx-auto px-6 pt-[88px] pb-16', wide ? 'max-w-[1000px]' : 'max-w-[660px]')}>
      <p className="mb-2.5 font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
        {eyebrow}
      </p>
      <h1 className="mb-2 text-[34px] font-semibold tracking-[-0.02em] text-balance text-ink">
        {title}
      </h1>
      {lede && <p className="mb-8 max-w-[60ch] text-base leading-[1.65] text-ink-dim">{lede}</p>}
      {children}
    </main>
  )
}

/**
 * One entry in a page's card stack.
 */
export function Card({
  title,
  meta,
  children,
}: {
  title: ReactNode
  meta?: ReactNode
  children?: ReactNode
}) {
  return (
    <article className="rounded-[10px] border border-line-soft bg-surface px-[18px] py-4">
      <h2 className="mb-1 text-[15px] font-semibold text-ink">{title}</h2>
      {children && <div className="text-[13.5px] leading-[1.6] text-ink-dim">{children}</div>}
      {meta && (
        <p className="mt-2.5 font-mono text-[11px] tracking-[0.03em] text-ink-faint">{meta}</p>
      )}
    </article>
  )
}
