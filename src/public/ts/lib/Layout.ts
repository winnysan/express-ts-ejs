import ApiClient from './ApiCLient'
import Carousel from './Carousel'
import CategoryHandler from './CategoryHandler'
import CategoryMultiSelectHandler from './CategoryMultiSelectHandler'
import Editor from './Editor'
import FormHandler from './FormHandler'
import Helper from './Helper'
import ImagePreviewHandler from './ImagePreviewHandler'
import Reactivity from './Reactivity'

/**
 * Layout class responsible for initializing various components and handling UI interactions.
 */
class Layout {
  /**
   * Initializes the layout, sets up event listeners, and initializes components.
   * @description Initializes reactivity, form handling, carousels, and various UI elements.
   */
  static initialize(): void {
    /**
     * Initialize Layout and Reactivity
     */
    Reactivity.initialize()

    /**
     * Initialize color mode switcher
     */
    Helper.colorModeSwitcher()

    /**
     * Initialize Editor, FormHandler, ImagePreviewHandler, CategoryHandlers
     */
    const editor = Editor.create('#form')
    new FormHandler('#form', 'input[name="_csrf"]', editor)
    new ImagePreviewHandler('#input-images', '#preview-images', '#drop-area')

    new FormHandler('#form-logout', 'input[name="_csrf"]')

    const categoryHandler = CategoryHandler.getInstance('#categories')
    categoryHandler.refresh()

    new CategoryMultiSelectHandler('#categories-multi-select')

    /**
     * Initialize Carousel
     */
    new Carousel('#carousel')

    /**
     * Fetch example using API client
     */
    const apiClient = new ApiClient('http://localhost:7000/api')

    const fetchButton = Helper.selectElement<HTMLSpanElement>('#fetchButton')

    fetchButton?.addEventListener('click', () => {
      apiClient
        .fetch<string>('Hello', 'hello')
        .then(response => {
          console.log('message:', response.message)
          if (response.data) {
            alert(response.data)
          }
        })
        .catch(error => console.error(error))
    })

    /**
     * Navigation elements
     */
    const hamburgerBtnEl = Helper.selectElement<HTMLButtonElement>('#hamburger')
    const navigationEl = Helper.selectElement<HTMLUListElement>('.navigation')
    const headerOverlayEl = Helper.selectElement<HTMLDivElement>('#header-overlay')
    const dropdownBtnEl = Helper.selectElement<HTMLButtonElement>('.dropdown__button')
    const dropdownMenuEl = Helper.selectElement<HTMLUListElement>('.dropdown__menu')
    const searchOverlayEl = Helper.selectElement<HTMLButtonElement>('#search-overlay')
    const openSearchEl = Helper.selectElement<HTMLButtonElement>('#search-open')
    const closeSearchEl = Helper.selectElement<HTMLButtonElement>('#search-close')
    const searchInputEl = Helper.selectElement<HTMLInputElement>('#search-input')
    const searchBtn = Helper.selectElement<HTMLButtonElement>('#search-button')

    /**
     * Mobile menu toggle
     * @description Toggles the navigation menu and header overlay on mobile devices.
     */
    hamburgerBtnEl?.addEventListener('click', () => {
      navigationEl?.classList.toggle('active')
      headerOverlayEl?.classList.toggle('active')
    })

    headerOverlayEl?.addEventListener('click', () => {
      navigationEl?.classList.remove('active')
      headerOverlayEl?.classList.remove('active')
    })

    /**
     * Dropdown menu toggle
     * @description Toggles the dropdown menu and handles clicks outside the menu to close it.
     */
    dropdownBtnEl?.addEventListener('click', event => {
      event.stopPropagation()
      dropdownMenuEl?.classList.toggle('active')
      dropdownBtnEl?.classList.toggle('active')
    })

    document.addEventListener('click', event => {
      const target = event.target as Node
      if (!dropdownBtnEl?.contains(target) && !dropdownMenuEl?.contains(target)) {
        dropdownMenuEl?.classList.remove('active')
      }
    })

    /**
     * Search overlay toggle
     * @description Opens and closes the search overlay and handles escape key to close it.
     */
    openSearchEl?.addEventListener('click', () => searchOverlayEl?.classList.toggle('active'))

    closeSearchEl?.addEventListener('click', () => searchOverlayEl?.classList.remove('active'))

    window.addEventListener('keyup', event => {
      if (event.key === 'Escape') searchOverlayEl?.classList.remove('active')
    })

    searchInputEl?.addEventListener('input', () => {
      if (searchBtn) {
        searchBtn.disabled = searchInputEl.value.trim() === ''
      }
    })

    /**
     * Set current date in the footer
     * @description Inserts the current date into the element with id 'date'.
     */
    const dateEl = Helper.selectElement<HTMLSpanElement>('#date')

    if (dateEl) dateEl.innerText = new Date().toLocaleDateString()

    if (window.env === 'development')
      console.log(window.localization.getLocalizedText('layoutListenersHaveBeenInitialized'))
  }
}

export default Layout
