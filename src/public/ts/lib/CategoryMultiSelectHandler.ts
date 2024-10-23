class CategoryMultiSelectHandler {
  private container!: HTMLElement
  private categoryInput!: HTMLInputElement
  private dropdown!: HTMLElement
  private selectedCategoriesContainer!: HTMLElement

  /**
   * Creates an instance of CategoryMultiSelectHandler.
   * @param selector - The selector for the container element.
   */
  constructor(selector: string) {
    const element = document.querySelector(selector)
    if (element) {
      this.container = element as HTMLElement
      this.initialize()
    }
  }

  /**
   * Initializes the component by setting up event listeners and elements.
   */
  private initialize() {
    this.categoryInput = this.container.querySelector('#category-input') as HTMLInputElement
    this.dropdown = this.container.querySelector('#category-dropdown') as HTMLElement
    this.selectedCategoriesContainer = this.container.querySelector('#selected-categories') as HTMLElement

    // Adding event listeners
    this.categoryInput.addEventListener('focus', () => this.showDropdown())
    document.addEventListener('click', e => this.handleDocumentClick(e))
    this.categoryInput.addEventListener('input', () => this.filterCategories())
    this.dropdown.addEventListener('click', e => this.handleDropdownClick(e))
    this.selectedCategoriesContainer.addEventListener('click', e => this.handleSelectedCategoriesClick(e))

    if (window.env === 'development')
      console.log(window.localization.getLocalizedText('categoryMultiselectHandlerHasBeenInitialized'))
  }

  /**
   * Adds a category to the selected categories.
   * @param catId - The ID of the category.
   * @param catName - The name of the category.
   */
  private addCategory(catId: string, catName: string) {
    const span = document.createElement('span')
    span.classList.add('selected-category')
    span.setAttribute('data-id', catId)
    span.innerHTML = `
          ${catName}
          <input type="hidden" name="categories[]" value="${catId}" />
          <button type="button" class="remove-category" data-id="${catId}">&times;</button>
      `
    this.selectedCategoriesContainer.appendChild(span)

    // Hide the item in the dropdown
    const dropdownItem = this.dropdown.querySelector(`.dropdown-item[data-id="${catId}"]`) as HTMLElement
    if (dropdownItem) {
      dropdownItem.style.display = 'none'
    }
  }

  /**
   * Removes a category from the selected categories.
   * @param catId - The ID of the category.
   */
  private removeCategory(catId: string) {
    const categorySpan = this.selectedCategoriesContainer.querySelector(`.selected-category[data-id="${catId}"]`)
    if (categorySpan) {
      categorySpan.remove()
    }

    // Show the item in the dropdown
    const dropdownItem = this.dropdown.querySelector(`.dropdown-item[data-id="${catId}"]`) as HTMLElement
    if (dropdownItem) {
      dropdownItem.style.display = 'block'
    }
  }

  /**
   * Displays the dropdown menu.
   */
  private showDropdown() {
    this.dropdown.style.display = 'block'
  }

  /**
   * Hides the dropdown menu.
   */
  private hideDropdown() {
    this.dropdown.style.display = 'none'
  }

  /**
   * Handles click events on the document to hide the dropdown when clicking outside.
   * @param e - The mouse event.
   */
  private handleDocumentClick(e: MouseEvent) {
    if (!this.container.contains(e.target as Node)) {
      this.hideDropdown()
    }
  }

  /**
   * Filters the categories in the dropdown based on the user's input.
   */
  private filterCategories() {
    const filter = this.categoryInput.value.toLowerCase()
    const items = this.dropdown.querySelectorAll('.dropdown-item')
    items.forEach(item => {
      const text = item.textContent?.toLowerCase()
      if (text?.includes(filter)) {
        ;(item as HTMLElement).style.display = 'block'
      } else {
        ;(item as HTMLElement).style.display = 'none'
      }
    })
  }

  /**
   * Handles click events on the dropdown menu to add categories to the selected list.
   * @param e - The mouse event.
   */
  private handleDropdownClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.classList.contains('dropdown-item')) {
      const catId = target.getAttribute('data-id')
      const catName = target.textContent?.trim()

      if (catId && catName) {
        this.addCategory(catId, catName)

        // Clear the input field
        this.categoryInput.value = ''
        this.hideDropdown()
      }
    }
  }

  /**
   * Handles click events on the selected categories to remove them.
   * @param e - The mouse event.
   */
  private handleSelectedCategoriesClick(e: MouseEvent) {
    const target = e.target as HTMLElement
    if (target.classList.contains('remove-category')) {
      const catId = target.getAttribute('data-id')
      if (catId) {
        this.removeCategory(catId)
      }
    }
  }
}

export default CategoryMultiSelectHandler
