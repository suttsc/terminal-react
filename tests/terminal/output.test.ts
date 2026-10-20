import { describe, expect, it } from 'vitest'
import { inline, menu, menuItem, navigate, window } from '@/terminal/output'

describe('outputs', () => {
  it('carry a type the client switches on', () => {
    expect(inline(['a'])).toEqual({ type: 'inline', lines: ['a'] })
    expect(menu('m', [menuItem('l', 'h', '/r')])).toEqual({
      type: 'menu',
      label: 'm',
      items: [{ label: 'l', hint: 'h', run: '/r', outcome: null }],
    })
    expect(navigate('projects')).toEqual({ type: 'navigate', url: '/projects' })
    expect(window('incident-report-003.txt', 'incident-report', { attempts: 3 })).toEqual({
      type: 'window',
      title: 'incident-report-003.txt',
      component: 'incident-report',
      props: { attempts: 3 },
    })
  })

  it('refuse unknown windows, routes and props at compile time', () => {
    // @ts-expect-error no window is registered under this name
    window('x.txt', 'abuot')
    // @ts-expect-error the link window needs its link
    window('x.url', 'link')
    // @ts-expect-error attempts is a number
    window('x.txt', 'incident-report', { attempts: 'three' })
    // @ts-expect-error navigate takes a route name, never a URL
    navigate('https://example.com')

    expect(true).toBe(true)
  })
})
