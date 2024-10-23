interface Dictionary {
  scriptLoadedSuccessfully: string
  csrfTokenNotFoundInTheResponse: string
  carouselHasBeenInitialized: string
  markdownEditorHasBeenInitialized: string
  formHandlerHasBeenInitialized: string
  imagePreviewHandlerHasBeenInitialized: string
  layoutListenersHaveBeenInitialized: string
  reactivityHasBeenInitialized: string
  spaRouterHasBeenInitialized: string
  categoryHandlerHasBeenInitialized: string
  categoryMultiselectHandlerHasBeenInitialized: string
  categoryDeleteConfirm: string
  error: string
  formSubmissionFailed: string
  noActionIsRequired: string
  somethingWentWrong: string
  appElementNotFound: string
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
