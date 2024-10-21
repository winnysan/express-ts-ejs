type Language = 'sk' | 'en'

window.localization = {
  lang: (document.documentElement.lang as Language) || 'sk',
  dictionaries: {
    sk: {
      scriptLoadedSuccessfully: 'Skript úspešne načítaný',
      csrfTokenNotFoundInTheResponse: 'CSRF token nebol nájdený v odpovedi',
      carouselHasBeenInitialized: 'Carousel bol inicializovaný',
      markdownEditorHasBeenInitialized: 'Markdown editor bol inicializovaný',
      formHandlerHasBeenInitialized: 'Form handler bol inicializovaný',
      imagePreviewHandlerHasBeenInitialized: 'Image preview handler bol inicializovaný',
      layoutListenersHaveBeenInitialized: 'Layout listeners boli inicializované',
      reactivityHasBeenInitialized: 'Reaktivita bola inicializovaná',
      spaRouterHasBeenInitialized: 'SPA router bol inicializovaný',
      categoryHandlerHasBeenInitialized: 'Category handler bol inicializovaný',
      categoryDeleteConfirm: 'Naozaj chcete odstrániť kategoriu vrátane všetkých podkategorii?',
      error: 'Chyba',
      formSubmissionFailed: 'Odoslanie formulára zlyhalo',
      noActionIsRequired: 'Nevyžaduje sa žiadna akcia',
      somethingWentWrong: 'Niečo sa pokazilo',
      appElementNotFound: 'App element sa nenašiel',
    },
    en: {
      scriptLoadedSuccessfully: 'Script loaded successfully',
      csrfTokenNotFoundInTheResponse: 'CSRF token not found in the response',
      carouselHasBeenInitialized: 'Carousel has been initialized',
      markdownEditorHasBeenInitialized: 'Markdown editor has been initialized',
      formHandlerHasBeenInitialized: 'Form handler has been initialized',
      imagePreviewHandlerHasBeenInitialized: 'Image preview handler has been initialized',
      layoutListenersHaveBeenInitialized: 'Layout listeners have been initialized',
      reactivityHasBeenInitialized: 'Reactivity has been initialized',
      spaRouterHasBeenInitialized: 'SPA router has been initialized',
      categoryHandlerHasBeenInitialized: 'Category handler has been initialized',
      categoryDeleteConfirm: 'Are you sure you want to delete this category and all its subcategories?',
      error: 'Error',
      formSubmissionFailed: 'Form submission failed',
      noActionIsRequired: 'No action is required',
      somethingWentWrong: 'Something went wrong',
      appElementNotFound: 'App element not found',
    },
  },
  getLocalizedText: function (key) {
    const localizedTexts = this.dictionaries[this.lang as Language] || this.dictionaries['sk']
    return localizedTexts[key]
  },
}
