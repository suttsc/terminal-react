export const PITCH = 8
const SEED = 7
const INKS = ['var(--line)', 'var(--text-faint)', 'var(--accent)']

/** Roughly one lit cell in a hundred twinkles, and never more than this many. */
const TWINKLE_RATE = 0.012
export const MAX_TWINKLERS = 60
/** Seconds for one fade up and back down; each cell gets its own, so they never sync. */
const SLOWEST = 16
const QUICKEST = 8

export type Twinkler = {
  /** Pixel offsets from the top left of the viewport. */
  left: number
  top: number
  /** Seconds for one fade up and back. */
  duration: number
  /** Negative, so every cell starts part-way through its own cycle. */
  delay: number
}

export type Field = {
  /** The still cells, as one box-shadow list. */
  shadow: string
  /** The few cells that fade in and out, kept out of the still list. */
  twinklers: Twinkler[]
}

export function hash(x: number, y: number, seed: number): number {
  let n = (x * 374761393 + y * 668265263 + seed * 1442695041) | 0
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  n = n ^ (n >>> 16)

  return (n >>> 0) / 4294967296
}

/**
 * Lit cells, clear around the focus point and thickening towards the edges.
 * Mostly line, some text-faint, rarely the accent; a sparse few twinkle.
 * Deterministic, so the same viewport always draws the same field.
 */
export function field(width: number, height: number, focusX: number, focusY: number): Field {
  const cols = Math.floor(width / PITCH)
  const rows = Math.floor(height / PITCH)
  const reachX = Math.max(focusX, width - focusX)
  const reachY = Math.max(focusY, height - focusY)
  const cells: string[] = []
  const twinklers: Twinkler[] = []

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

      if (twinklers.length < MAX_TWINKLERS && hash(x + 13001, y + 13001, SEED) < TWINKLE_RATE) {
        const duration = QUICKEST + hash(x + 17001, y + 17001, SEED) * (SLOWEST - QUICKEST)

        twinklers.push({
          left: x * PITCH,
          top: y * PITCH,
          duration: Math.round(duration * 10) / 10,
          delay: -Math.round(hash(x + 19001, y + 19001, SEED) * duration * 10) / 10,
        })

        continue
      }

      const tier = hash(x + 9001, y + 9001, SEED)
      const ink = INKS[tier < 0.03 ? 2 : tier < 0.2 ? 1 : 0]

      cells.push(`${x * PITCH}px ${y * PITCH}px 0 ${ink}`)
    }
  }

  return { shadow: cells.join(', '), twinklers }
}
