import { describe, expect, it } from 'vitest'
import { asSignature, hasArguments, matchCommands, normalise } from '@/shell/match-commands'
import type { ManifestEntry } from '@/terminal/types'

const entry = (signature: string): ManifestEntry => ({
  signature,
  description: '',
  outcome: 'inline',
})

const commands = ['/help', '/link', '/link add', '/links', '/theme', '/uptime'].map(entry)
const signatures = (query: string) => matchCommands(commands, query).map((c) => c.signature)

describe('matching what was typed', () => {
  it('normalises case, spacing and the slash', () => {
    expect(normalise('  Theme   Amber ')).toBe('/theme amber')
    expect(normalise('/help')).toBe('/help')
  })

  it('reads typed text the way the server will', () => {
    expect(asSignature('//AI')).toBe('/ai')
    expect(asSignature(' about ')).toBe('/about')
  })

  it('spots arguments after a signature', () => {
    expect(hasArguments('/theme amber', '/theme')).toBe(true)
    expect(hasArguments('/theme', '/theme')).toBe(false)
    expect(hasArguments('/themes', '/theme')).toBe(false)
  })

  it('ranks exact matches, then prefixes, then anything containing the text', () => {
    expect(signatures('/he')).toEqual(['/help', '/theme'])
    expect(signatures('time')).toEqual(['/uptime'])
  })

  it('puts the longer signature first when both are typed in full', () => {
    expect(signatures('/link add').slice(0, 2)).toEqual(['/link add', '/link'])
  })

  it('keeps a command whose arguments are being typed', () => {
    expect(signatures('/theme amb')).toEqual(['/theme'])
  })

  it('drops everything when nothing matches', () => {
    expect(signatures('/xyz')).toEqual([])
  })
})
