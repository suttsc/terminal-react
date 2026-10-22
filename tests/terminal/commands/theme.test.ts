import { describe, expect, it } from 'vitest'
import { makeTestContext, manifestSignatures, run } from '../../support/make-test-context'

describe('/theme', () => {
  it('offers each theme and marks the current one', async () => {
    const { ctx } = makeTestContext({ cookies: { theme: 'cold' } })

    await expect(run('/theme', ctx)).resolves.toEqual({
      type: 'menu',
      label: 'themes',
      items: [
        { label: 'amber', hint: 'the default', run: '/theme amber', outcome: null },
        {
          label: 'phosphor',
          hint: 'green, like it used to be',
          run: '/theme phosphor',
          outcome: null,
        },
        { label: 'cold', hint: 'blue, for focus · current', run: '/theme cold', outcome: null },
        { label: 'ember', hint: 'warm, for evenings', run: '/theme ember', outcome: null },
        { label: 'paper', hint: 'light, for daylight', run: '/theme paper', outcome: null },
      ],
    })
  })

  it('marks amber as current when nothing, or nonsense, has been chosen', async () => {
    for (const cookies of [{}, { theme: 'beige' }] as Record<string, string>[]) {
      const output = await run('/theme', makeTestContext({ cookies }).ctx)

      expect(output.type === 'menu' && output.items[0]?.hint).toBe('the default · current')
    }
  })

  it('remembers a chosen theme for a year, whatever its case', async () => {
    const { ctx, cookies } = makeTestContext()

    await expect(run('/theme Phosphor', ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['phosphor. Noted.'],
      refresh: true,
    })
    expect(cookies.get('theme')).toBe('phosphor')
    expect(cookies.maxAges.get('theme')).toBe(31_536_000)
  })

  it('does not change the theme when asked for one that does not exist', async () => {
    const { ctx, cookies } = makeTestContext({ cookies: { theme: 'ember' } })

    await expect(run('/theme beige', ctx)).resolves.toEqual({
      type: 'inline',
      lines: ['No phosphor by the name of beige.'],
    })
    expect(cookies.get('theme')).toBe('ember')
  })

  it('is listed for everyone', () => {
    expect(manifestSignatures(false)).toContain('/theme')
  })
})
