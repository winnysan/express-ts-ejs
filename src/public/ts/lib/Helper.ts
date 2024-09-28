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
   * Static method to create or return a toast element by ID.
   * @param {string} id - The ID of the toast element to create or select.
   * @returns {HTMLUListElement} The toast element.
   */
  static makeToast(id: string): HTMLUListElement {
    let toastEl = Helper.selectElement<HTMLUListElement>(id)

    if (!toastEl) {
      toastEl = document.createElement('ul')
      toastEl.id = id.replace('#', '')
      document.body.appendChild(toastEl)
    }

    toastEl.innerHTML = ''

    return toastEl
  }

  /**
   * Adds a toast message with a specified type and allows setting the disappearance time.
   *
   * @param {HTMLUListElement} toastEl - The element where the toast message will be inserted.
   * @param {string} message - The text of the message to display in the toast.
   * @param {'info' | 'success' | 'warning' | 'danger'} [type='info'] - The type of the message (toast style), default is 'info'.
   * @param {number} [duration=5000] - The duration in milliseconds after which the toast will disappear, default is 5000ms (5 seconds).
   * @returns {void}
   */
  static addToastMessage(
    toastEl: HTMLUListElement,
    message: string,
    type: 'info' | 'success' | 'warning' | 'danger' = 'info',
    duration: number = 5000
  ): void {
    const li = document.createElement('li')
    li.textContent = message
    li.classList.add(type)

    toastEl.appendChild(li)

    setTimeout(() => {
      li.classList.add('fade-out')

      setTimeout(() => {
        li.remove()
      }, 500) // 0.5 seconds corresponds to the CSS opacity transition
    }, duration) // The duration after which the toast will disappear (in milliseconds)
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

  /**
   * Creates a debounced version of a function that delays its execution.
   * The function will only be executed after the specified delay time has passed
   * without it being called again.
   *
   * @param {Function} func - The function to debounce.
   * @param {number} delay - The delay time in milliseconds.
   * @returns {Function} A debounced version of the original function.
   *
   * @example
   * window.addEventListener('resize', Helper.debounce(() => {
   *   console.log('Window resized!');
   * }, 1000));
   */
  static debounce<T extends (...args: any[]) => void>(func: T, delay: number): (...args: Parameters<T>) => void {
    let timeoutId: number | undefined

    return (...args: Parameters<T>): void => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      timeoutId = window.setTimeout(() => {
        func(...args)
      }, delay)
    }
  }
}

export default Helper
