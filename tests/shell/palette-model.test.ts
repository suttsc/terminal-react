import { describe, expect, it } from 'vitest'
import { paletteFooter, paletteView } from '@/shell/palette-model'
import { inline, menu, menuItem } from '@/terminal/output'
import type { ManifestEntry } from '@/terminal/types'

const commands: ManifestEntry[] = [
  { signature: '/about', description: 'Who is running this', outcome: 'window' },
  { signature: '/help', description: 'Everything this thing can do', outcome: 'menu' },
  { signature: '/theme', description: 'Change the whole palette', outcome: 'menu' },
]

const view = (query: string, output: Parameters<typeof paletteView>[0]['output'] = null) =>
  paletteView({ commands, output, query })

const labels = (query: string, output?: Parameters<typeof paletteView>[0]['output']) =>
  view(query, output).options.map((option) => option.label)

const themes = menu('themes', [
  menuItem('amber', 'the default · current', '/theme amber'),
  menuItem('cold', 'blue, for focus', '/theme cold'),
])

describe('the palette', () => {
  it('lists every command when nothing is typed', () => {
    expect(view('')).toMatchObject({ section: 'commands', asking: false })
    expect(labels('')).toEqual(['/about', '/help', '/theme'])
    expect(paletteFooter(view(''), { waiting: false })).toEqual({
      left: 'type / for commands',
      right: '↑↓ move   ↵ run',
    })
  })

  it('narrows to what matches, and counts them', () => {
    expect(labels('/he')).toEqual(['/help', '/theme'])
    expect(paletteFooter(view('/he'), { waiting: false }).left).toBe('2 results')
    expect(paletteFooter(view('/ab'), { waiting: false }).left).toBe('1 result')
  })

  it('offers to ask when nothing matches', () => {
    expect(view('why is the sky').options).toEqual([
      { label: 'Ask', hint: '“why is the sky”', run: '/ask why is the sky', outcome: 'inline' },
    ])
    expect(view('//odd').options[0]?.run).toBe('/ask odd')
    expect(paletteFooter(view('nope'), { waiting: false })).toEqual({
      left: 'nothing matched',
      right: '↵ ask',
    })
  })

  it('shows inline output with no options until something is typed', () => {
    const output = inline(['0 posts.'])

    expect(view('', output)).toMatchObject({ inline: output, options: [], section: '' })
    expect(view('/ab', output).inline).toBeNull()
    expect(paletteFooter(view('', output), { waiting: false }).left).toBe('esc to clear')
  })

  it('filters a menu by label or hint', () => {
    expect(labels('', themes)).toEqual(['amber', 'cold'])
    expect(labels('focus', themes)).toEqual(['cold'])
    expect(view('', themes).section).toBe('themes')
  })

  it('knows a theme menu, and says what it is previewing', () => {
    expect(view('', themes).isThemeMenu).toBe(true)
    expect(view('', menu('commands', [menuItem('/about', '', '/about')])).isThemeMenu).toBe(false)
    expect(paletteFooter(view('', themes), { previewing: 'cold', waiting: false })).toEqual({
      left: '1–2 to pick · previewing cold',
      right: '↵ keep · esc revert',
    })
  })

  it('says it is working while a slow command runs', () => {
    expect(paletteFooter(view(''), { waiting: true }).left).toBe('working…')
  })
})
