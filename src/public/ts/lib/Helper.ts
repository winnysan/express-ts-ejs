/**
 * A helper class for various utility functions.
 */
class Helper {
  /**
   * Selects an element based on a CSS selector and casts it to the correct type.
   *
   * @template T - The type of the HTMLElement.
   * @param {string} selector - The CSS selector of the element to select.
   * @returns {T | null} The selected element cast to the correct type, or null if not found.
   *
   * @example
   * const button = Helper.selectElement<HTMLButtonElement>('#submit-button');
   */
  static selectElement<T extends HTMLElement>(selector: string): T | null {
    return document.querySelector(selector) as T | null
  }

  /**
   * Saves a value to localStorage.
   *
   * @param {string} key - The key under which the value will be stored in localStorage.
   * @param {any} value - The value to be stored. Can be any type that can be serialized to JSON.
   *
   * @example
   * Helper.saveToLocalStorage('user', { name: 'Alice', age: 30 });
   */
  static saveToLocalStorage(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value))
  }

  /**
   * Loads a value from localStorage.
   *
   * @param {string} key - The key under which the value is stored in localStorage.
   * @returns {T | undefined} The loaded value of type T, or undefined if the value does not exist.
   *
   * @template T - The type of the value being loaded from localStorage.
   *
   * @example
   * const user = Helper.loadFromLocalStorage<{ name: string, age: number }>('user');
   * console.log(user?.name); // Logs the user's name if the value exists
   */
  static loadFromLocalStorage<T>(key: string): T | undefined {
    const storedValue = localStorage.getItem(key)
    return storedValue ? JSON.parse(storedValue) : undefined
  }

  /**
   * Appends an error message to a specified unordered list element.
   *
   * This helper function creates a new list item (`<li>`) element with the given message,
   * and appends it to the provided unordered list (`<ul>`) element. This is useful for
   * dynamically displaying error messages in the UI.
   *
   * @param {HTMLUListElement} errorsEl - The unordered list element to which the error message will be appended.
   * @param {string} message - The error message to be displayed. This message will be set as the text content of the new list item.
   *
   * @example
   * // Assuming 'errorsEl' is a reference to an existing <ul> element in the DOM
   * Helper.addErrorMessage(errorsEl, 'Form submission failed');
   *
   * // This will add a new <li> element with the text "Form submission failed" to the errorsEl <ul> element.
   */
  static addErrorMessage(errorsEl: HTMLUListElement, message: string): void {
    const li = document.createElement('li')
    li.textContent = message
    errorsEl.appendChild(li)
  }

  /**
   * Switches the color mode between light and dark based on button clicks.
   * The function adds event listeners to elements with the class `color_mode_button`
   * and updates the `data-color-mode` attribute on the `documentElement` accordingly.
   * The selected mode is also saved to localStorage.
   */
  static colorModeSwitcher(): void {
    const buttons = document.querySelectorAll<HTMLButtonElement>('.color-mode__button')

    buttons.forEach(button => {
      button.addEventListener('click', (event: Event) => {
        const targetElement = event.currentTarget as HTMLButtonElement
        const elementId = targetElement.id

        if (elementId === 'enable-light-mode') {
          document.documentElement.setAttribute('data-color-mode', 'light')
          localStorage.setItem('data-color-mode', 'light')
        } else if (elementId === 'enable-dark-mode') {
          document.documentElement.setAttribute('data-color-mode', 'dark')
          localStorage.setItem('data-color-mode', 'dark')
        }
      })
    })
  }

  /**
   * Logs the selector and z-index of elements when hovered over.
   * This method listens for 'mouseover' events and logs the element's CSS selector and z-index.
   *
   * @example
   * Helper.logElementDetailsOnHover();
   */
  static logElementDetailsOnHover(): void {
    document.addEventListener('mouseover', (event: MouseEvent) => {
      const element = event.target as HTMLElement

      if (element) {
        let selector = element.tagName.toLowerCase()
        if (element.id) {
          selector += `#${element.id}`
        }
        if (element.className) {
          selector += `.${element.className.split(' ').join('.')}`
        }

        const zIndex = window.getComputedStyle(element).zIndex

        console.log(`Selector: ${selector}, z-index: ${zIndex}`)
      }
    })
  }
}

export default Helper
