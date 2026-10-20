export const linkCategories = [
  'architecture',
  'laravel',
  'leadership',
  'design',
  'testing',
  'other',
] as const

export type LinkCategory = (typeof linkCategories)[number]
