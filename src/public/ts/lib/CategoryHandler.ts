import ApiClient from './ApiCLient'
import Helper from './Helper'

class CategoryHandler {
  private static instance: CategoryHandler | null = null
  private categoriesEl: HTMLDivElement | null = null
  private apiClient: ApiClient
  private inputDebounceMap: WeakMap<HTMLInputElement, (data: any) => void> = new WeakMap()
  private listenersAttached: boolean = false

  // Bind the event handlers to avoid multiple bindings
  private handleClickBound: (event: MouseEvent) => void
  private handleInputBound: (event: Event) => void

  private categoriesId: string

  // Private constructor to prevent direct instantiation
  private constructor(categoriesId: string) {
    this.categoriesId = categoriesId
    this.apiClient = new ApiClient('http://localhost:7000/api')

    this.handleClickBound = this.handleClick.bind(this)
    this.handleInputBound = this.handleInput.bind(this)
    this.initialize()
  }

  // Static method to get the singleton instance
  public static getInstance(categoriesId: string): CategoryHandler {
    if (!CategoryHandler.instance) {
      CategoryHandler.instance = new CategoryHandler(categoriesId)
    }
    return CategoryHandler.instance
  }

  // Initialize the handler: attach event listeners once and process the DOM
  private initialize(): void {
    this.attachEventListeners()
    this.processDOM()
  }

  // Method to attach event listeners
  private attachEventListeners(): void {
    this.categoriesEl = document.querySelector(this.categoriesId) as HTMLDivElement | null
    if (this.categoriesEl) {
      if (!this.listenersAttached) {
        this.categoriesEl.addEventListener('input', this.handleInputBound)
        this.categoriesEl.addEventListener('click', this.handleClickBound)
        this.listenersAttached = true
        console.log('Event listeners attached.')
      }
    } else {
      console.error(`Element s ID "${this.categoriesId}" nebol nájdený počas inicializácie.`)
    }
  }

  // Public method to refresh the handler, e.g., when navigating back to the page
  public refresh(): void {
    const newCategoriesEl = document.querySelector(this.categoriesId) as HTMLDivElement | null
    if (newCategoriesEl && newCategoriesEl !== this.categoriesEl) {
      // Remove event listeners from the old element
      if (this.categoriesEl && this.listenersAttached) {
        this.categoriesEl.removeEventListener('input', this.handleInputBound)
        this.categoriesEl.removeEventListener('click', this.handleClickBound)
        console.log('Old event listeners removed.')
      }

      // Update categoriesEl to the new element
      this.categoriesEl = newCategoriesEl

      // Attach event listeners to the new element
      if (this.categoriesEl) {
        this.categoriesEl.addEventListener('input', this.handleInputBound)
        this.categoriesEl.addEventListener('click', this.handleClickBound)
        console.log('New event listeners attached.')
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

  // Method to process the current DOM: add buttons to <li> elements and update states
  private processDOM(): void {
    if (!this.categoriesEl) {
      console.error(`Element s ID "${this.categoriesId}" nebol nájdený počas processDOM().`)
      return
    }

    const existingLis: NodeListOf<HTMLLIElement> = this.categoriesEl.querySelectorAll('li')

    existingLis.forEach((li: HTMLLIElement) => {
      const buttonsGroup: HTMLDivElement | null = li.querySelector('.buttons-group')
      if (buttonsGroup && buttonsGroup.children.length === 0) {
        buttonsGroup.appendChild(this.createButtons())
        console.log(`Buttons added to li with ID: ${li.id}`)
      }
    })

    // Aktualizácia stavu tlačidiel Up a Down
    this.updateButtonsState()

    // Skryjeme alebo zobrazíme tlačidlo "Add First" podľa potreby
    this.showOrHideAddFirstButton()
  }

  // Event handler pre input udalosti s debounce efektom
  private handleInput(event: Event): void {
    const target = event.target as HTMLElement
    if (target.tagName.toLowerCase() === 'input') {
      const input: HTMLInputElement = target as HTMLInputElement
      const li: HTMLLIElement | null = input.closest('li')
      if (li) {
        const data = { action: 'input', id: li.id, value: input.value }
        console.log(`Input event: ${JSON.stringify(data)}`)

        // Získame alebo vytvoríme debounced funkciu pre toto vstupné pole
        let debouncedSendData = this.inputDebounceMap.get(input)
        if (!debouncedSendData) {
          debouncedSendData = Helper.debounce((data: any) => this.sendData(data), 300)
          this.inputDebounceMap.set(input, debouncedSendData)
          console.log(`Debounced function created for input with ID: ${input.id}`)
        }

        // Zavoláme debounced funkciu s dátami
        debouncedSendData(data)
      }
    }
  }

  // Event handler pre click udalosti
  private handleClick(event: MouseEvent): void {
    const target = event.target as HTMLElement
    console.log(`Click event on: ${target.tagName}, ID: ${target.id}, Classes: ${target.className}`)

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

  // Metóda na odoslanie dát na API
  private sendData(data: object, tempId?: string): void {
    console.log(`Sending data to API: ${JSON.stringify(data)}, tempId: ${tempId}`)
    this.apiClient
      .fetch(data, 'categories')
      .then(response => {
        console.log('Server response:', response)
        // @ts-ignore
        if (response.newId && tempId) {
          // Nahradíme dočasné ID skutočným _id z databázy
          const liElement = document.getElementById(tempId)
          if (liElement) {
            // @ts-ignore
            liElement.id = response.newId
          }
        }
      })
      .catch(error => console.error('Error:', error))
  }

  // Generovanie jedinečného 8-miestneho ID
  private generateUniqueId(): string {
    return Math.floor(10000000 + Math.random() * 90000000).toString()
  }

  // Vytvorenie skupiny tlačidiel pre kategóriu
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

  // Aktualizácia stavu tlačidiel "Up" a "Down"
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

  // Zobrazenie alebo skrytie tlačidla "Add First" podľa toho, či existujú kategórie
  private showOrHideAddFirstButton(): void {
    if (!this.categoriesEl) return

    let addFirstButton: HTMLButtonElement | null = document.getElementById('add-first') as HTMLButtonElement | null
    const existingUl: HTMLUListElement | null = this.categoriesEl.querySelector('ul')

    if (existingUl && existingUl.querySelectorAll('li').length > 0) {
      if (addFirstButton) {
        addFirstButton.style.display = 'none'
        console.log('Hide "Add First" button.')
      }
    } else {
      if (addFirstButton) {
        addFirstButton.style.display = 'block'
        console.log('Show "Add First" button.')
      } else {
        // Vytvoríme tlačidlo "Add First" ak neexistuje
        addFirstButton = document.createElement('button')
        addFirstButton.id = 'add-first'
        addFirstButton.textContent = 'Add First'
        this.categoriesEl.appendChild(addFirstButton)
        console.log('"Add First" button created and shown.')
      }
    }
  }

  // Pridanie prvej kategórie
  private addFirstCategory(): void {
    const tempId = 'category-' + this.generateUniqueId() // Dočasné ID
    const data = { action: 'addFirst', id: 'add-first-button' }
    this.sendData(data, tempId)

    // Vytvoríme nový <li> s inputom a tlačidlami
    const newLi: HTMLLIElement = document.createElement('li')
    newLi.id = tempId // Priradíme dočasné ID

    const input: HTMLInputElement = document.createElement('input')
    input.type = 'text'
    input.value = ''

    const buttonsGroup: HTMLDivElement = this.createButtons()

    newLi.appendChild(input)
    newLi.appendChild(buttonsGroup)

    // Vytvoríme <ul> a pridáme nový <li>
    const ul: HTMLUListElement = document.createElement('ul')
    ul.appendChild(newLi)

    if (this.categoriesEl) {
      this.categoriesEl.innerHTML = '' // Vymažeme tlačidlo "Add First"
      this.categoriesEl.appendChild(ul)
      console.log('Added first category.')
    }

    // Aktualizujeme stav tlačidiel
    this.updateButtonsState()
  }

  // Pridanie kategórie po vybranej položke
  private addCategory(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const tempId = 'category-' + this.generateUniqueId() // Dočasné ID
      const data = { action: 'add', after: li.id }
      this.sendData(data, tempId)

      // Vytvoríme nový <li> s inputom a tlačidlami
      const newLi: HTMLLIElement = document.createElement('li')
      newLi.id = tempId // Priradíme dočasné ID

      const input: HTMLInputElement = document.createElement('input')
      input.type = 'text'
      input.value = ''

      const buttonsGroup: HTMLDivElement = this.createButtons()

      newLi.appendChild(input)
      newLi.appendChild(buttonsGroup)

      // Vložíme nový <li> za aktuálny <li>
      li.parentNode?.insertBefore(newLi, li.nextSibling)
      console.log(`Added category after ${li.id}`)

      // Aktualizujeme stav tlačidiel
      this.updateButtonsState()
      this.showOrHideAddFirstButton()
    }
  }

  // Pridanie vnorené kategórie
  private addNestedCategory(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const tempId = 'category-' + this.generateUniqueId() // Dočasné ID
      const data = { action: 'addNested', nested: li.id }
      this.sendData(data, tempId)

      // Nájdeme alebo vytvoríme vnorený <ul>
      let ul: HTMLUListElement | null = li.querySelector('ul')
      if (!ul) {
        ul = document.createElement('ul')
        li.appendChild(ul)
      }

      // Vytvoríme nový vnorený <li> s inputom a tlačidlami
      const newLi: HTMLLIElement = document.createElement('li')
      newLi.id = tempId // Priradíme dočasné ID

      const input: HTMLInputElement = document.createElement('input')
      input.type = 'text'
      input.value = ''

      const buttonsGroup: HTMLDivElement = this.createButtons()

      newLi.appendChild(input)
      newLi.appendChild(buttonsGroup)

      // Pridáme nový <li> do vnoreného <ul>
      ul.appendChild(newLi)
      console.log(`Added nested category under ${li.id}`)

      // Aktualizujeme stav tlačidiel
      this.updateButtonsState()
      this.showOrHideAddFirstButton()
    }
  }

  // Odstránenie kategórie a jej podkategórií
  private deleteCategory(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const confirmDelete: boolean = confirm('Are you sure you want to delete this category and all its subcategories?')
      if (confirmDelete) {
        const data = { action: 'delete', id: li.id }
        this.sendData(data)
        li.remove()
        console.log(`Deleted category with ID: ${li.id}`)

        // Skontrolujeme, či už neexistujú žiadne kategórie
        this.showOrHideAddFirstButton()

        // Aktualizujeme stav tlačidiel
        this.updateButtonsState()
      }
    }
  }

  // Posunutie kategórie hore v zozname
  private moveCategoryUp(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const prevLi: HTMLLIElement | null = li.previousElementSibling as HTMLLIElement | null
      if (prevLi) {
        li.parentNode?.insertBefore(li, prevLi)
        const data = { action: 'up', id: li.id }
        this.sendData(data)
        console.log(`Moved category up: ${li.id}`)

        // Aktualizujeme stav tlačidiel
        this.updateButtonsState()
      }
    }
  }

  // Posunutie kategórie dole v zozname
  private moveCategoryDown(target: HTMLElement): void {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const nextLi: HTMLLIElement | null = li.nextElementSibling as HTMLLIElement | null
      if (nextLi) {
        li.parentNode?.insertBefore(nextLi, li)
        const data = { action: 'down', id: li.id }
        this.sendData(data)
        console.log(`Moved category down: ${li.id}`)

        // Aktualizujeme stav tlačidiel
        this.updateButtonsState()
      }
    }
  }

  // Metóda na odstránenie event listenerov a čistotu
  public destroy(): void {
    if (!this.listenersAttached) return

    if (this.categoriesEl) {
      this.categoriesEl.removeEventListener('input', this.handleInputBound)
      this.categoriesEl.removeEventListener('click', this.handleClickBound)
      console.log('Event listeners detached.')
    }

    this.listenersAttached = false
  }
}

export default CategoryHandler
