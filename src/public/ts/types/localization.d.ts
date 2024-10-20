interface Dictionary {
  scriptLoadedSuccessfully: string
}

interface Localization {
  lang: Language
  dictionaries: {
    en: Dictionary
    sk: Dictionary
  }
  getLocalizedText: (key: keyof Dictionary) => string
}

interface Window {
  localization: Localization
}
