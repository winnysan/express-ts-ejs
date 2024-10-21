import Helper from './Helper'

/**
 * SpaRouter class responsible for handling SPA navigation.
 */
class SpaRouter {
  private static initializePage?: () => void

  /**
   * Initializes a new instance of the SpaRouter class.
   * @param initializePage - Optional callback to initialize the page after navigation.
   * @description Sets up SPA navigation and event listeners for link clicks and history changes.
   */
  constructor(initializePage?: () => void) {
    SpaRouter.initializePage = initializePage
    this.initialize()
  }

  /**
   * Navigates to a new URL without reloading the entire page.
   * @param url - The target URL to navigate to.
   * @description Performs AJAX navigation and updates the browser's history state without a full page reload.
   */
  public static navigateTo(url: string): void {
    const loadingIndicator = Helper.selectElement<HTMLDivElement>('#loading')
    if (loadingIndicator) {
      loadingIndicator.style.display = 'flex'
    }

    SpaRouter.loadPage(url, true)
      .catch((err: Error) => console.error(console.error(`${window.localization.getLocalizedText('error')}:`, err)))
      .finally(() => {
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none'
        }
      })
  }

  /**
   * Loads a page via AJAX and updates the content.
   * @param url - The URL to fetch.
   * @param updateHistory - Whether to update the browser's history state.
   * @description Fetches the content and updates the '#app' element.
   */
  private static loadPage(url: string, updateHistory: boolean): Promise<void> {
    return fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest', // Indicates an AJAX request
      },
    })
      .then((response: Response) => {
        if (!response.ok) {
          if (response.status === 404) return response.text()

          throw new Error(`${window.localization.getLocalizedText('error')}: ${response.status}`)
        }
        return response.text() // Fetches the response as HTML text
      })
      .then((html: string) => {
        const appElement = Helper.selectElement<HTMLDivElement>('#app')
        if (appElement) {
          appElement.innerHTML = html

          // Extracting the title
          const mainTagRegex = /<main[^>]*data-title="([^"]*)"[^>]*>/i
          const match = mainTagRegex.exec(html)
          if (match && match[1]) {
            document.title = match[1]
          } else {
            document.title = ''
          }
        } else {
          console.error(window.localization.getLocalizedText('appElementNotFound'))
          return
        }

        // Updates browser history if required
        if (updateHistory) {
          history.pushState(null, '', url)
        }

        // Initializes page elements after navigation
        if (SpaRouter.initializePage) {
          SpaRouter.initializePage()
        }
      })
  }

  /**
   * Initializes the SPA router.
   * @description Sets up event listeners for link clicks and browser navigation events (back/forward).
   */
  private initialize(): void {
    /**
     * Event listener for link clicks with the 'data-link' attribute.
     * @description Intercepts link clicks and navigates via SPA without page reload.
     */
    document.body.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const link = target.closest('[data-link]')

      if (link && link.matches('[data-link]')) {
        e.preventDefault()
        const href = link.getAttribute('href')
        if (href) {
          SpaRouter.navigateTo(href)
        }
      }
    })

    /**
     * Event listener for 'popstate' events.
     * @description Handles browser back/forward button navigation by fetching the current URL's content.
     */
    window.addEventListener('popstate', () => {
      const url = location.pathname + location.search
      SpaRouter.loadPage(url, false).catch((err: Error) =>
        console.error(console.error(`${window.localization.getLocalizedText('error')}:`, err))
      )
    })

    // Initialize the page on first load
    if (SpaRouter.initializePage) {
      SpaRouter.initializePage()
    }

    console.log(window.localization.getLocalizedText('spaRouterHasBeenInitialized'))
  }
}

export default SpaRouter
