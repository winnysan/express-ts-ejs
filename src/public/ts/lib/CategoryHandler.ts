import ApiClient, { ApiResponse } from './ApiCLient'
import Helper from './Helper'

type ApiCategoryResponse = ApiResponse & {
  status?: number
  newId?: string
}

class CategoryHandler {
  private static instance: CategoryHandler | null = null
  private categoriesEl: HTMLDivElement | null = null
  private apiClient: ApiClient<ApiCategoryResponse>
  private inputDebounceMap: WeakMap<HTMLInputElement, (data: any) => void> = new WeakMap()
  private listenersAttached: boolean = false

  // Bind the event handlers to avoid multiple bindings
  private handleClickBound: (event: MouseEvent) => void
  private handleInputBound: (event: Event) => void

  private categoriesId: string

  // Private constructor to prevent direct instantiation
  private constructor(categoriesId: string) {
    this.categoriesId = categoriesId
    this.apiClient = new ApiClient<ApiCategoryResponse>('http://localhost:7000/api')

    this.handleClickBound = this.handleClick.bind(this)
    this.handleInputBound = this.handleInput.bind(this)
    this.initialize()
  }

  /**
   * Static method to get the singleton instance
   * @param categoriesId - The ID of the categories element
   * @returns {CategoryHandler} - The singleton instance of CategoryHandler
   */
  public static getInstance(categoriesId: string): CategoryHandler {
    if (!CategoryHandler.instance) {
      CategoryHandler.instance = new CategoryHandler(categoriesId)
    }
    return CategoryHandler.instance
  }

  /**
   * Initialize the handler: attach event listeners once and process the DOM
   */
  private initialize(): void {
    this.attachEventListeners()
    this.processDOM()

    console.log(window.localization.getLocalizedText('categoryHandlerHasBeenInitialized'))
  }

  /**
   * Method to attach event listeners
   */
  private attachEventListeners(): void {
    this.categoriesEl = document.querySelector(this.categoriesId) as HTMLDivElement | null
    if (this.categoriesEl) {
      if (!this.listenersAttached) {
        this.categoriesEl.addEventListener('input', this.handleInputBound)
        this.categoriesEl.addEventListener('click', this.handleClickBound)
        this.listenersAttached = true
      }
    }
  }

  /**
   * Public method to refresh the handler, e.g., when navigating back to the page
   */
  public refresh(): void {
    const newCategoriesEl = document.querySelector(this.categoriesId) as HTMLDivElement | null
    if (newCategoriesEl && newCategoriesEl !== this.categoriesEl) {
      // Remove event listeners from the old element
      if (this.categoriesEl && this.listenersAttached) {
        this.categoriesEl.removeEventListener('input', this.handleInputBound)
        this.categoriesEl.removeEventListener('click', this.handleClickBound)
      }

      // Update categoriesEl to the new element
      this.categoriesEl = newCategoriesEl

      // Attach event listeners to the new element
      if (this.categoriesEl) {
        this.categoriesEl.addEventListener('input', this.handleInputBound)
        this.categoriesEl.addEventListener('click', this.handleClickBound)
      }

      // Reprocess the DOM
      this.processDOM()
    } else if (!this.categoriesEl) {
      // If categoriesEl was not found, attempt to attach event listeners
      this.attachEventListeners()
      this.processDOM()
    } else {
      // categoriesEl is the same, just reprocess the DOM
      this.processDOM()
    }
  }

  /**
   * Method to process the current DOM: add buttons to <li> elements and update states
   */
  private processDOM(): void {
    if (!this.categoriesEl) return

    const existingLis: NodeListOf<HTMLLIElement> = this.categoriesEl.querySelectorAll('li')

    existingLis.forEach((li: HTMLLIElement) => {
      const buttonsGroup: HTMLDivElement | null = li.querySelector('.buttons-group')
      if (buttonsGroup && buttonsGroup.children.length === 0) {
        buttonsGroup.appendChild(this.createButtons())
      }
    })

    // Update the state of the Up and Down buttons
    this.updateButtonsState()

    // Show or hide the "Add First" button as needed
    this.showOrHideAddFirstButton()
  }

  /**
   * Event handler for input events with debounce effect
   * @param event - The input event
   */
  private handleInput(event: Event): void {
    const target = event.target as HTMLElement
    if (target.tagName.toLowerCase() === 'input') {
      const input: HTMLInputElement = target as HTMLInputElement
      const li: HTMLLIElement | null = input.closest('li')
      if (li) {
        const data = { action: 'input', id: li.id, value: input.value }

        // Get or create a debounced function for this input
        let debouncedSendData = this.inputDebounceMap.get(input)
        if (!debouncedSendData) {
          debouncedSendData = Helper.debounce((data: any) => this.sendData(data), 300)
          this.inputDebounceMap.set(input, debouncedSendData)
        }

        // Call the debounced function with the data
        debouncedSendData(data)
      }
    }
  }

  /**
   * Event handler for click events
   * @param event - The click event
   */
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement

    if (target.id === 'add-first') {
      this.addFirstCategory()
    } else if (target.classList.contains('add')) {
      this.addCategory(target)
    } else if (target.classList.contains('add-nested')) {
      this.addNestedCategory(target)
    } else if (target.classList.contains('delete')) {
      this.deleteCategory(target)
    } else if (target.classList.contains('up')) {
      this.moveCategoryUp(target)
    } else if (target.classList.contains('down')) {
      this.moveCategoryDown(target)
    }
  }

  /**
   * Method to send data to the API
   * @param data - The data to be sent
   * @param tempId - Optional temporary ID
   */
  private sendData(data: object, tempId?: string): void {
    this.apiClient
      .fetch(data, 'categories')
      .then(response => {
        if (response.newId && tempId) {
          // Replace temporary ID with the actual _id from the database
          const liElement = document.getElementById(tempId)
          if (liElement) {
            liElement.id = response.newId
          }
        }
      })
      .catch(err => console.error(`${window.localization.getLocalizedText('error')}:`, err))
  }

  /**
   * Generate a unique 8-digit ID
   * @returns {string} - The unique ID
   */
  private generateUniqueId(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString()
  }

  /**
   * Create a group of buttons for a category
   * @returns {HTMLDivElement} - The buttons group
   */
  private createButtons(): HTMLDivElement {
    const buttonsGroup: HTMLDivElement = document.createElement('div')
    buttonsGroup.className = 'buttons-group'

    const addButton: HTMLButtonElement = document.createElement('button')
    addButton.className = 'add'
    addButton.textContent = 'Add'

    const addNestedButton: HTMLButtonElement = document.createElement('button')
    addNestedButton.className = 'add-nested'
    addNestedButton.textContent = 'Add Nested'

    const deleteButton: HTMLButtonElement = document.createElement('button')
    deleteButton.className = 'delete'
    deleteButton.textContent = 'Delete'

    const upButton: HTMLButtonElement = document.createElement('button')
    upButton.className = 'up'
    upButton.textContent = 'Up'

    const downButton: HTMLButtonElement = document.createElement('button')
    downButton.className = 'down'
    downButton.textContent = 'Down'

    buttonsGroup.appendChild(addButton)
    buttonsGroup.appendChild(addNestedButton)
    buttonsGroup.appendChild(deleteButton)
    buttonsGroup.appendChild(upButton)
    buttonsGroup.appendChild(downButton)

    return buttonsGroup
  }

  /**
   * Update the state of the "Up" and "Down" buttons
   */
  private updateButtonsState(): void {
    if (!this.categoriesEl) return

    const allLists: NodeListOf<HTMLUListElement> = this.categoriesEl.querySelectorAll('ul')

    allLists.forEach((ul: HTMLUListElement) => {
      const listItems: NodeListOf<HTMLLIElement> = ul.querySelectorAll('li')
      listItems.forEach((li: HTMLLIElement, index: number) => {
        const upButton: HTMLButtonElement | null = li.querySelector('button.up')
        const downButton: HTMLButtonElement | null = li.querySelector('button.down')

        if (upButton) {
          upButton.disabled = index === 0
        }

        if (downButton) {
          downButton.disabled = index === listItems.length - 1
        }
      })
    })
  }

  /**
   * Show or hide the "Add First" button based on whether categories exist
   */
  private showOrHideAddFirstButton(): void {
    if (!this.categoriesEl) return

    let addFirstButton: HTMLButtonElement | null = document.getElementById('add-first') as HTMLButtonElement | null
    const existingUl: HTMLUListElement | null = this.categoriesEl.querySelector('ul')

    if (existingUl && existingUl.querySelectorAll('li').length > 0) {
      if (addFirstButton) {
        addFirstButton.style.display = 'none'
      }
    } else {
      if (addFirstButton) {
        addFirstButton.style.display = 'block'
      } else {
        // Create the "Add First" button if it does not exist
        addFirstButton = document.createElement('button')
        addFirstButton.id = 'add-first'
        addFirstButton.textContent = 'Add First'
        this.categoriesEl.appendChild(addFirstButton)
      }
    }
  }

  /**
   * Add the first category
   */
  private addFirstCategory(): void {
    const tempId = 'category-' + this.generateUniqueId() // Temporary ID
    const data = { action: 'addFirst', id: 'add-first-button' }
    this.sendData(data, tempId)

    // Create a new <li> with input and buttons
    const newLi: HTMLLIElement = document.createElement('li')
    newLi.id = tempId // Assign temporary ID

    const input: HTMLInputElement = document.createElement('input')
    input.type = 'text'
    input.value = ''

    const buttonsGroup: HTMLDivElement = this.createButtons()

    newLi.appendChild(input)
    newLi.appendChild(buttonsGroup)

    // Create <ul> and add the new <li>
    const ul: HTMLUListElement = document.createElement('ul')
    ul.appendChild(newLi)

    if (this.categoriesEl) {
      this.categoriesEl.innerHTML = '' // Clear the "Add First" button
      this.categoriesEl.appendChild(ul)
    }

    // Update the state of the buttons
    this.updateButtonsState()
  }

  /**
   * Add a category after the selected item
   * @param target - The target element that triggered the action
   */
  private addCategory(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const tempId = 'category-' + this.generateUniqueId() // Temporary ID
      const data = { action: 'add', after: li.id }
      this.sendData(data, tempId)

      // Create a new <li> with input and buttons
      const newLi: HTMLLIElement = document.createElement('li')
      newLi.id = tempId // Assign temporary ID

      const input: HTMLInputElement = document.createElement('input')
      input.type = 'text'
      input.value = ''

      const buttonsGroup: HTMLDivElement = this.createButtons()

      newLi.appendChild(input)
      newLi.appendChild(buttonsGroup)

      // Insert the new <li> after the current <li>
      li.parentNode?.insertBefore(newLi, li.nextSibling)

      // Update the state of the buttons
      this.updateButtonsState()
      this.showOrHideAddFirstButton()
    }
  }

  /**
   * Add a nested category
   * @param target - The target element that triggered the action
   */
  private addNestedCategory(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const tempId = 'category-' + this.generateUniqueId() // Temporary ID
      const data = { action: 'addNested', nested: li.id }
      this.sendData(data, tempId)

      // Find or create a nested <ul>
      let ul: HTMLUListElement | null = li.querySelector('ul')
      if (!ul) {
        ul = document.createElement('ul')
        li.appendChild(ul)
      }

      // Create a new nested <li> with input and buttons
      const newLi: HTMLLIElement = document.createElement('li')
      newLi.id = tempId // Assign temporary ID

      const input: HTMLInputElement = document.createElement('input')
      input.type = 'text'
      input.value = ''

      const buttonsGroup: HTMLDivElement = this.createButtons()

      newLi.appendChild(input)
      newLi.appendChild(buttonsGroup)

      // Append the new <li> to the nested <ul>
      ul.appendChild(newLi)

      // Update the state of the buttons
      this.updateButtonsState()
      this.showOrHideAddFirstButton()
    }
  }

  /**
   * Remove a category and its subcategories
   * @param target - The target element that triggered the action
   */
  private deleteCategory(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const confirmDelete: boolean = confirm(window.localization.getLocalizedText('categoryDeleteConfirm'))
      if (confirmDelete) {
        const data = { action: 'delete', id: li.id }
        this.sendData(data)
        li.remove()

        // Check if there are no categories left
        this.showOrHideAddFirstButton()

        // Update the state of the buttons
        this.updateButtonsState()
      }
    }
  }

  /**
   * Move a category up in the list
   * @param target - The target element that triggered the action
   */
  private moveCategoryUp(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const prevLi: HTMLLIElement | null = li.previousElementSibling as HTMLLIElement | null
      if (prevLi) {
        li.parentNode?.insertBefore(li, prevLi)
        const data = { action: 'up', id: li.id }
        this.sendData(data)

        // Update the state of the buttons
        this.updateButtonsState()
      }
    }
  }

  /**
   * Move a category down in the list
   * @param target - The target element that triggered the action
   */
  private moveCategoryDown(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const nextLi: HTMLLIElement | null = li.nextElementSibling as HTMLLIElement | null
      if (nextLi) {
        li.parentNode?.insertBefore(nextLi, li)
        const data = { action: 'down', id: li.id }
        this.sendData(data)

        // Update the state of the buttons
        this.updateButtonsState()
      }
    }
  }

  /**
   * Method to remove event listeners and clean up
   */
  public destroy(): void {
    if (!this.listenersAttached) return

    if (this.categoriesEl) {
      this.categoriesEl.removeEventListener('input', this.handleInputBound)
      this.categoriesEl.removeEventListener('click', this.handleClickBound)
    }

    this.listenersAttached = false
  }
}

export default CategoryHandler
