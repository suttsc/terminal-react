'use client'

import { useMemo, useSyncExternalStore } from 'react'

const PITCH = 8
const SEED = 7
const INKS = ['var(--line)', 'var(--text-faint)', 'var(--accent)']

function hash(x: number, y: number, seed: number): number {
  let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  n = n ^ (n >>> 16)

  return (n >>> 0) / 4294967296
}

/**
 * Lit cells as one box-shadow list: clear around the focus point, thickening
 * towards the edges. Mostly line, some text-faint, rarely the accent.
 */
function field(width: number, height: number, focusX: number, focusY: number): string {
  const cols = Math.floor(width / PITCH)
  const rows = Math.floor(height / PITCH)
  const reachX = Math.max(focusX, width - focusX)
  const reachY = Math.max(focusY, height - focusY)
  const cells: string[] = []

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const dx = (x * PITCH + 3 - focusX) / reachX
      const dy = (y * PITCH + 3 - focusY) / reachY
      let density = (Math.sqrt(dx * dx + dy * dy) / Math.SQRT2 - 0.4) / 0.6

      if (density <= 0) {
        continue
      }

      density = Math.min(density, 1)
      density = density * density * (3 - 2 * density)

      const noise =
        0.55 * hash(x >> 2, y >> 2, SEED) +
        0.3 * hash((x >> 1) + 977, (y >> 1) + 977, SEED) +
        0.15 * hash(x + 4001, y + 4001, SEED)

      if (noise > density * 0.62) {
        continue
      }

      const tier = hash(x + 9001, y + 9001, SEED)
      const ink = INKS[tier < 0.03 ? 2 : tier < 0.2 ? 1 : 0]

      cells.push(`${x * PITCH}px ${y * PITCH}px 0 ${ink}`)
    }
  }

  return cells.join(', ')
}

function onResize(notify: () => void) {
  window.addEventListener('resize', notify)

  return () => window.removeEventListener('resize', notify)
}

// Snapped to 64px so a resize redraws a handful of times, not on every pixel.
const viewport = () =>
  `${Math.ceil(window.innerWidth / 64) * 64}x${Math.ceil(window.innerHeight / 64) * 64}`
const noViewport = () => null

/**
 * The desktop's pixel field. Decoration only: hidden from assistive tech and
 * from the pointer.
 */
export default function PixelField() {
  const size = useSyncExternalStore(onResize, viewport, noViewport)

  const shadow = useMemo(() => {
    if (size === null) {
      return 'none'
    }

    const [width, height] = size.split('x').map(Number) as [number, number]

    return field(width, height, width / 2, height * 0.4)
  }, [size])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute top-0 left-0 size-1.5" style={{ boxShadow: shadow }} />
    </div>
  )
}
