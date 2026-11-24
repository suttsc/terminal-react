import { describe, expect, it } from 'vitest'
import { shouldReturnFocus } from '@/shell/focus-return'

describe('handing focus back when a window closes', () => {
  it('always returns it to keyboard users', () => {
    expect(shouldReturnFocus({ byKeyboard: true, targetIsEditable: true })).toBe(true)
    expect(shouldReturnFocus({ byKeyboard: true, targetIsEditable: false })).toBe(true)
  })

  it('never drops a click or tap back into a text field', () => {
    expect(shouldReturnFocus({ byKeyboard: false, targetIsEditable: true })).toBe(false)
  })

  it('still returns it to anything else after a click', () => {
    expect(shouldReturnFocus({ byKeyboard: false, targetIsEditable: false })).toBe(true)
  })
})
