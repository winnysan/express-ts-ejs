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

    fetch(url, {
      headers: {
        'X-Requested-With': 'XMLHttpRequest', // Indicates an AJAX request
      },
    })
      .then((response: Response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        return response.text() // Fetches the response as HTML text
      })
      .then((html: string) => {
        const appElement = Helper.selectElement<HTMLDivElement>('#app')
        if (appElement) {
          appElement.innerHTML = html
        } else {
          console.error("Element with id 'app' not found.")
          return
        }

        // Updates browser history without page reload
        history.pushState(null, '', url)

        // Initializes page elements after navigation
        if (SpaRouter.initializePage) {
          SpaRouter.initializePage()
        }
      })
      .catch((err: Error) => console.error('Error loading page:', err))
      .finally(() => {
        if (loadingIndicator) {
          loadingIndicator.style.display = 'none'
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
      fetch(location.pathname + location.search, {
        headers: {
          'X-Requested-With': 'XMLHttpRequest', // Indicates an AJAX request
        },
      })
        .then((response: Response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          return response.text()
        })
        .then((html: string) => {
          const appElement = Helper.selectElement<HTMLDivElement>('#app')
          if (appElement) {
            appElement.innerHTML = html
          } else {
            console.error("Element with id 'app' not found.")
            return
          }

          if (SpaRouter.initializePage) {
            SpaRouter.initializePage()
          }
        })
        .catch((err: Error) => console.error('Error loading page:', err))
    })

    // Initialize the page on first load
    if (SpaRouter.initializePage) {
      SpaRouter.initializePage()
    }
  }
}

export default SpaRouter
