import { describe, expect, it } from 'vitest'
import { sign, unsign } from '@/lib/signing'

describe('signed cookies', () => {
  it('reads back what it signed', () => {
    expect(unsign(sign('3'))).toBe('3')
  })

  it('refuses a value the browser changed', () => {
    const signed = sign('3')

    expect(unsign(signed.replace(/^3/, '1'))).toBeUndefined()
    expect(unsign('1')).toBeUndefined()
    expect(unsign(undefined)).toBeUndefined()
  })
})
