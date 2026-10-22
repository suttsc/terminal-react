'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { field } from '@/shell/pixel-field-model'
import type { Field } from '@/shell/pixel-field-model'

function onResize(notify: () => void) {
  window.addEventListener('resize', notify)

  return () => window.removeEventListener('resize', notify)
}

// Snapped to 64px so a resize redraws a handful of times, not on every pixel.
const viewport = () =>
  `${Math.ceil(window.innerWidth / 64) * 64}x${Math.ceil(window.innerHeight / 64) * 64}`
const noViewport = () => null

const empty: Field = { shadow: 'none', twinklers: [] }

/**
 * The desktop's pixel field. Decoration only: hidden from assistive tech and
 * from the pointer. A sparse few cells fade slowly between the accent and
 * almost nothing; with reduced motion they sit still and dim.
 */
export default function PixelField() {
  const size = useSyncExternalStore(onResize, viewport, noViewport)

  const { shadow, twinklers } = useMemo(() => {
    if (size === null) {
      return empty
    }

    const [width, height] = size.split('x').map(Number) as [number, number]

    return field(width, height, width / 2, height * 0.4)
  }, [size])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-0 size-1.5" style={{ boxShadow: shadow }} />
      {twinklers.map((cell) => (
        <span
          key={`${cell.left}x${cell.top}`}
          className="absolute size-1.5 bg-accent opacity-25 motion-safe:animate-twinkle"
          style={{
            left: cell.left,
            top: cell.top,
            animationDuration: `${cell.duration}s`,
            animationDelay: `${cell.delay}s`,
          }}
        />
      ))}
    </div>
  )
}
