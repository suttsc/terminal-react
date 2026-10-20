/**
 * Every path the site links to by name. Commands navigate by key, never by URL.
 */
export const routes = {
  home: '/',
  about: '/about',
  hire: '/hire',
  projects: '/projects',
  links: '/links',
  tools: '/tools',
  terminal: '/terminal',
  storeLink: '/api/links',
  authGoogle: '/auth/google',
} as const

export type RouteName = keyof typeof routes

export const linkPath = (id: number): string => `/links/${id}`

export const toolPath = (slug: string): string => `/tools/${slug}`
