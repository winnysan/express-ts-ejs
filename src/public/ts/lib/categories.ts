import ApiClient from './ApiCLient'
import Helper from './Helper'

// Inicializácia ApiClient s základným endpointom
const apiClient = new ApiClient('http://localhost:7000/api')

// Funkcia na odoslanie dát na API s možnosťou aktualizácie ID
function sendData(data: object, tempId?: string): void {
  apiClient
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

/**
 * Funkcia na generovanie jedinečného 8-miestneho náhodného čísla.
 * @returns Jedinečné 8-miestne číslo ako string.
 */
function generateUniqueId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString()
}

// Mapovanie vstupných polí na ich debounced funkcie
const inputDebounceMap = new WeakMap<HTMLInputElement, (data: any) => void>()

/**
 * Funkcia na vytvorenie tlačidiel pre kategóriu.
 * @returns HTMLDivElement obsahujúci tlačidlá.
 */
function createButtons(): HTMLDivElement {
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
 * Funkcia na aktualizáciu stavu tlačidiel Up a Down.
 */
function updateButtonsState(): void {
  const categoriesContainer: HTMLElement | null = document.getElementById('categories')
  if (!categoriesContainer) return

  const allLists: NodeListOf<HTMLUListElement> = categoriesContainer.querySelectorAll('ul')

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
 * Funkcia na pridanie tlačidla "Add First" ak je potrebné.
 */
function showOrHideAddFirstButton(): void {
  const categoriesContainer: HTMLElement | null = document.getElementById('categories')
  if (!categoriesContainer) return

  const addFirstButton: HTMLButtonElement | null = document.getElementById('add-first') as HTMLButtonElement | null
  const existingUl: HTMLUListElement | null = categoriesContainer.querySelector('ul')

  if (existingUl && existingUl.querySelectorAll('li').length > 0) {
    if (addFirstButton) {
      addFirstButton.style.display = 'none'
    }
  } else {
    if (addFirstButton) {
      addFirstButton.style.display = 'block'
    } else {
      // Vytvoríme tlačidlo "Add First" ak neexistuje
      const button: HTMLButtonElement = document.createElement('button')
      button.id = 'add-first'
      button.textContent = 'Add First'
      categoriesContainer.appendChild(button)
    }
  }
}

// Inicializácia existujúcich <li> prvkov po načítaní stránky
document.addEventListener('DOMContentLoaded', () => {
  const categoriesContainer: HTMLElement | null = document.getElementById('categories')
  if (!categoriesContainer) return

  const existingLis: NodeListOf<HTMLLIElement> = categoriesContainer.querySelectorAll('li')

  existingLis.forEach((li: HTMLLIElement) => {
    const buttonsGroup: HTMLDivElement | null = li.querySelector('.buttons-group')
    if (buttonsGroup && buttonsGroup.children.length === 0) {
      buttonsGroup.appendChild(createButtons())
    }
  })

  // Aktualizácia stavu tlačidiel Up a Down
  updateButtonsState()

  // Skryjeme tlačidlo Add First, ak existujú kategórie
  showOrHideAddFirstButton()
})

/**
 * Event delegácia pre zmenu hodnoty vstupných polí s debounce efektom.
 */
document.getElementById('categories')?.addEventListener('input', (event: Event) => {
  const target = event.target as HTMLElement
  if (target.tagName.toLowerCase() === 'input') {
    const input: HTMLInputElement = target as HTMLInputElement
    const li: HTMLLIElement | null = input.closest('li')
    if (li) {
      const data = { action: 'input', id: li.id, value: input.value }

      // Získame alebo vytvoríme debounced funkciu pre toto vstupné pole
      let debouncedSendData = inputDebounceMap.get(input)
      if (!debouncedSendData) {
        debouncedSendData = Helper.debounce((data: any) => sendData(data), 300)
        inputDebounceMap.set(input, debouncedSendData)
      }

      // Zavoláme debounced funkciu s dátami
      debouncedSendData(data)
    }
  }
})

/**
 * Event delegácia pre kliknutia na tlačidlá "Add First", "Add", "Add Nested", "Delete", "Up" a "Down".
 */
document.addEventListener('click', (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // Pridávanie prvej kategórie
  if (target.id === 'add-first') {
    const tempId = 'category-' + generateUniqueId() // Dočasné ID
    const data = { action: 'addFirst', id: 'add-first-button' }
    sendData(data, tempId)

    // Vytvoríme nový <li> s inputom a tlačidlami
    const newLi: HTMLLIElement = document.createElement('li')
    newLi.id = tempId // Priradíme dočasné ID

    const input: HTMLInputElement = document.createElement('input')
    input.type = 'text'
    input.value = ''

    const buttonsGroup: HTMLDivElement = createButtons()

    newLi.appendChild(input)
    newLi.appendChild(buttonsGroup)

    // Vytvoríme <ul> a pridáme nový <li>
    const ul: HTMLUListElement = document.createElement('ul')
    ul.appendChild(newLi)

    const categoriesContainer: HTMLElement | null = document.getElementById('categories')
    if (categoriesContainer) {
      categoriesContainer.innerHTML = '' // Vymažeme tlačidlo "Add First"
      categoriesContainer.appendChild(ul)
    }

    // Aktualizujeme stav tlačidiel
    updateButtonsState()
  } else if (target.classList.contains('add')) {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const tempId = 'category-' + generateUniqueId() // Dočasné ID
      const data = { action: 'add', after: li.id }
      sendData(data, tempId)

      // Vytvoríme nový <li> s inputom a tlačidlami
      const newLi: HTMLLIElement = document.createElement('li')
      newLi.id = tempId // Priradíme dočasné ID

      const input: HTMLInputElement = document.createElement('input')
      input.type = 'text'
      input.value = ''

      const buttonsGroup: HTMLDivElement = createButtons()

      newLi.appendChild(input)
      newLi.appendChild(buttonsGroup)

      // Vložíme nový <li> za aktuálny <li>
      li.parentNode?.insertBefore(newLi, li.nextSibling)

      // Aktualizujeme stav tlačidiel
      updateButtonsState()
      showOrHideAddFirstButton()
    }
  } else if (target.classList.contains('add-nested')) {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const tempId = 'category-' + generateUniqueId() // Dočasné ID
      const data = { action: 'addNested', nested: li.id }
      sendData(data, tempId)

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

      const buttonsGroup: HTMLDivElement = createButtons()

      newLi.appendChild(input)
      newLi.appendChild(buttonsGroup)

      // Pridáme nový <li> do vnoreného <ul>
      ul.appendChild(newLi)

      // Aktualizujeme stav tlačidiel
      updateButtonsState()
      showOrHideAddFirstButton()
    }
  } else if (target.classList.contains('delete')) {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const confirmDelete: boolean = confirm('Are you sure you want to delete this category and all its subcategories?')
      if (confirmDelete) {
        const data = { action: 'delete', id: li.id }
        sendData(data)
        li.remove()

        // Skontrolujeme, či už neexistujú žiadne kategórie
        showOrHideAddFirstButton()

        // Aktualizujeme stav tlačidiel
        updateButtonsState()
      }
    }
  } else if (target.classList.contains('up')) {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const prevLi: HTMLLIElement | null = li.previousElementSibling as HTMLLIElement | null
      if (prevLi) {
        li.parentNode?.insertBefore(li, prevLi)
        const data = { action: 'up', id: li.id }
        sendData(data)

        // Aktualizujeme stav tlačidiel
        updateButtonsState()
      }
    }
  } else if (target.classList.contains('down')) {
    const li: HTMLLIElement | null = target.closest('li') as HTMLLIElement | null
    if (li) {
      const nextLi: HTMLLIElement | null = li.nextElementSibling as HTMLLIElement | null
      if (nextLi) {
        li.parentNode?.insertBefore(nextLi, li)
        const data = { action: 'down', id: li.id }
        sendData(data)

        // Aktualizujeme stav tlačidiel
        updateButtonsState()
      }
    }
  }
})
