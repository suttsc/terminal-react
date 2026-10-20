import { isTheme, THEME_COOKIE, themeOrDefault, themes } from '@/lib/themes'
import type { Theme } from '@/lib/themes'
import { inline, menu, menuItem } from '@/terminal/output'
import { defineCommand } from '@/terminal/types'

const ONE_YEAR = 60 * 60 * 24 * 365

export default defineCommand({
  signature: '/theme',
  description: 'Change the whole palette',
  outcome: 'menu',
  handle: async (ctx) => {
    const choice = ctx.arg(0)

    if (choice === undefined) {
      const current = themeOrDefault(ctx.cookies.get(THEME_COOKIE))

      return menu(
        'themes',
        (Object.entries(themes) as [Theme, string][]).map(([theme, description]) =>
          menuItem(
            theme,
            theme === current ? `${description} · current` : description,
            `/theme ${theme}`,
          ),
        ),
      )
    }

    const theme = choice.toLowerCase()

    if (!isTheme(theme)) {
      return inline([`No phosphor by the name of ${choice}.`])
    }

    ctx.cookies.set(THEME_COOKIE, theme, { maxAge: ONE_YEAR })

    return inline([`${theme}. Noted.`])
  },
})
