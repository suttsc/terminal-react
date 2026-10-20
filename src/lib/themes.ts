export const themes = {
  amber: 'the default',
  phosphor: 'green, like it used to be',
  cold: 'blue, for focus',
  ember: 'warm, for evenings',
  paper: 'light, for daylight',
} as const

export type Theme = keyof typeof themes

export const THEME_COOKIE = 'theme'

export const isTheme = (value: unknown): value is Theme =>
  typeof value === 'string' && Object.hasOwn(themes, value)

/** Unknown or missing means amber. */
export const themeOrDefault = (value: unknown): Theme => (isTheme(value) ? value : 'amber')
