type Language = 'sk' | 'en'

window.localization = {
  lang: (document.documentElement.lang as Language) || 'sk',
  dictionaries: {
    sk: {
      scriptLoadedSuccessfully: 'Skrtipt úspešne načítaný',
    },
    en: {
      scriptLoadedSuccessfully: 'Script loaded successfully',
    },
  },
  getLocalizedText: function (key) {
    const localizedTexts = this.dictionaries[this.lang as Language] || this.dictionaries['sk']
    return localizedTexts[key]
  },
}
