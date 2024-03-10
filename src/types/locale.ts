export const locale = {
  defaultLocale: 'sk',
  locales: ['sk', 'en'],
} as const

export type Locale = (typeof locale)['locales'][number]
