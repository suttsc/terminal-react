import { describe, expect, it } from 'vitest'
import { field, MAX_TWINKLERS, PITCH } from '@/shell/pixel-field-model'

const cellsOf = (shadow: string) =>
  shadow === '' ? [] : shadow.split(', ').map((cell) => cell.split(' ').slice(0, 2).join(' '))

describe('the pixel field', () => {
  const desktop = field(1280, 832, 640, 332.8)

  it('draws the same field for the same viewport', () => {
    expect(field(1280, 832, 640, 332.8)).toEqual(desktop)
  })

  it('twinkles sparsely: a handful of cells, never more than the cap', () => {
    const still = cellsOf(desktop.shadow).length

    expect(desktop.twinklers.length).toBeGreaterThan(5)
    expect(desktop.twinklers.length).toBeLessThanOrEqual(MAX_TWINKLERS)
    expect(desktop.twinklers.length / (still + desktop.twinklers.length)).toBeLessThan(0.03)
    expect(field(3840, 2176, 1920, 870.4).twinklers.length).toBeLessThanOrEqual(MAX_TWINKLERS)
  })

  it('keeps twinkling cells out of the still layer, on the grid', () => {
    const still = new Set(cellsOf(desktop.shadow))

    for (const cell of desktop.twinklers) {
      expect(cell.left % PITCH).toBe(0)
      expect(cell.top % PITCH).toBe(0)
      expect(still.has(`${cell.left}px ${cell.top}px`)).toBe(false)
    }
  })

  it('fades slowly, each cell out of step with the rest', () => {
    for (const cell of desktop.twinklers) {
      expect(cell.duration).toBeGreaterThanOrEqual(8)
      expect(cell.duration).toBeLessThanOrEqual(16)
      expect(cell.delay).toBeLessThanOrEqual(0)
      expect(-cell.delay).toBeLessThanOrEqual(cell.duration)
    }

    expect(new Set(desktop.twinklers.map((cell) => cell.duration)).size).toBeGreaterThan(3)
  })

  it('leaves the space around the palette clear', () => {
    const nearFocus = desktop.twinklers.filter(
      (cell) => Math.abs(cell.left - 640) < 200 && Math.abs(cell.top - 332) < 120,
    )

    expect(nearFocus).toEqual([])
  })
})
