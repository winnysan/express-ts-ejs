// Funkcia na vytvorenie tlačidiel
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

// Funkcia na aktualizáciu stavu tlačidiel Up a Down
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

// Funkcia na pridanie tlačidla "Add First" ak je potrebné
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

// Event delegácia pre zmenu hodnoty vstupných polí
document.getElementById('categories')?.addEventListener('input', (event: Event) => {
  const target = event.target as HTMLElement
  if (target.tagName.toLowerCase() === 'input') {
    const input: HTMLInputElement = target as HTMLInputElement
    const li: HTMLLIElement | null = input.closest('li')
    if (li) {
      console.log({ id: li.id, value: input.value })
    }
  }
})

// Event delegácia pre kliknutia na tlačidlá "Add First", "Add", "Add Nested", "Delete", "Up" a "Down"
document.addEventListener('click', (event: MouseEvent) => {
  const target = event.target as HTMLElement

  // Pridávanie prvej kategórie
  if (target.id === 'add-first') {
    console.log({ addFirst: 'add-first-button' })

    // Vytvoríme nový <li> s inputom a tlačidlami
    const newLi: HTMLLIElement = document.createElement('li')
    newLi.id = 'category-' + Date.now() // Generujeme jedinečné ID

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
      console.log({ after: li.id })

      // Vytvoríme nový <li> s inputom a tlačidlami
      const newLi: HTMLLIElement = document.createElement('li')
      newLi.id = 'category-' + Date.now() // Generujeme jedinečné ID

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
      console.log({ nested: li.id })

      // Nájdeme alebo vytvoríme vnorený <ul>
      let ul: HTMLUListElement | null = li.querySelector('ul')
      if (!ul) {
        ul = document.createElement('ul')
        li.appendChild(ul)
      }

      // Vytvoríme nový vnorený <li> s inputom a tlačidlami
      const newLi: HTMLLIElement = document.createElement('li')
      newLi.id = 'category-' + Date.now() // Generujeme jedinečné ID

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
        console.log({ delete: li.id })
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
        console.log({ up: li.id })

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
        console.log({ down: li.id })

        // Aktualizujeme stav tlačidiel
        updateButtonsState()
      }
    }
  }
})
