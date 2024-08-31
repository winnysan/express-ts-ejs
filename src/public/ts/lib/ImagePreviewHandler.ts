import Helper from './Helper'

/**
 * A class to handle image preview functionality with drag-and-drop support.
 */
class ImagePreviewHandler {
  private inputEl: HTMLInputElement | null
  private previewEl: HTMLUListElement | null
  private dropAreaEl: HTMLLabelElement | null
  private files: File[] = []
  private draggedItem: HTMLElement | null = null

  /**
   * Initializes the ImagePreviewHandler with the image input, preview container, and drop area selectors.
   * @param {string} inputSelector - The CSS selector for the image input element.
   * @param {string} previewSelector - The CSS selector for the image preview container element.
   * @param {string} dropAreaSelector - The CSS selector for the drop area element.
   */
  constructor(inputSelector: string, previewSelector: string, dropAreaSelector: string) {
    this.inputEl = Helper.selectElement<HTMLInputElement>(inputSelector)
    this.previewEl = Helper.selectElement<HTMLUListElement>(previewSelector)
    this.dropAreaEl = Helper.selectElement<HTMLLabelElement>(dropAreaSelector)

    if (this.inputEl && this.previewEl && this.dropAreaEl) {
      this.initialize()
    }
  }

  /**
   * Sets up the event listeners for the image input and drag-and-drop events.
   */
  private initialize() {
    this.inputEl?.addEventListener('change', e => this.handleImageChange(e))

    if (this.dropAreaEl) {
      this.dropAreaEl.addEventListener('dragover', e => this.handleDragOver(e))
      this.dropAreaEl.addEventListener('dragleave', () => this.handleDragLeave())
      this.dropAreaEl.addEventListener('drop', e => this.handleDrop(e))

      // Add listener to open file dialog on click
      this.dropAreaEl.addEventListener('click', () => this.inputEl?.click())
    }

    console.log('The image preview handler with drag-and-drop support has been initialized')
  }

  /**
   * Handles the image input change event and generates the image previews.
   * @param {Event} event - The change event triggered by the image input.
   */
  private handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement
    const newFiles = input.files

    if (newFiles) {
      // Filter out non-image files
      const imageFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'))

      // Add only image files to the list
      this.files.push(...imageFiles)
      this.updateInputFiles()
      this.renderPreviews()
    }
  }

  /**
   * Handles the dragover event to allow dropping.
   * @param {DragEvent} event - The dragover event.
   */
  private handleDragOver(event: DragEvent) {
    event.preventDefault()
    this.dropAreaEl?.classList.add('drop-area__dragging')
  }

  /**
   * Handles the dragleave event to remove visual feedback.
   */
  private handleDragLeave() {
    this.dropAreaEl?.classList.remove('drop-area__dragging')
  }

  /**
   * Handles the drop event to process dropped files.
   * @param {DragEvent} event - The drop event triggered by dropping files onto the drop area.
   */
  private handleDrop(event: DragEvent) {
    event.preventDefault()
    this.dropAreaEl?.classList.remove('drop-area__dragging')

    const newFiles = event.dataTransfer?.files

    if (newFiles) {
      // Filter out non-image files
      const imageFiles = Array.from(newFiles).filter(file => file.type.startsWith('image/'))

      // Add only image files to the list
      this.files.push(...imageFiles)
      this.updateInputFiles()
      this.renderPreviews()
    }
  }

  /**
   * Displays the image preview with a remove button.
   * @param {ProgressEvent<FileReader>} event - The file reader load event containing the image data.
   * @param {number} index - The index of the image in the file list.
   */
  private displayImage(event: ProgressEvent<FileReader>, index: number) {
    const imgContainer = document.createElement('li')
    imgContainer.setAttribute('draggable', 'true')
    imgContainer.classList.add('preview-images__image-container')

    const imgEl = document.createElement('img')
    imgEl.src = event.target?.result as string
    imgEl.classList.add('preview-images__image')

    const removeBtn = document.createElement('button')
    removeBtn.textContent = 'Remove'
    removeBtn.classList.add('preview-images__remove-button')

    // Stop propagation on the container and its children
    imgContainer.addEventListener('click', e => e.stopPropagation())
    removeBtn.addEventListener('click', e => this.removeImage(index))

    imgContainer.appendChild(imgEl)
    imgContainer.appendChild(removeBtn)
    this.previewEl?.appendChild(imgContainer)
  }

  /**
   * Removes the selected image from the preview and the file list.
   * @param {number} index - The index of the image to remove.
   */
  private removeImage(index: number) {
    this.files.splice(index, 1)
    this.updateInputFiles()
    this.renderPreviews()
  }

  /**
   * Updates the input element's files property with the current file list.
   */
  private updateInputFiles() {
    const dataTransfer = new DataTransfer()
    this.files.forEach(file => dataTransfer.items.add(file))
    if (this.inputEl) {
      this.inputEl.files = dataTransfer.files
    }
  }

  /**
   * Re-renders the image previews after a file has been removed.
   */
  private renderPreviews() {
    if (this.previewEl) {
      this.previewEl.innerHTML = ''
      this.files.forEach((file, index) => {
        const reader = new FileReader()
        reader.onload = e => this.displayImage(e, index)
        reader.readAsDataURL(file)
      })
      this.initializeReordering()
    }
  }

  /**
   * Initializes the reordering of images through drag-and-drop.
   */
  private initializeReordering() {
    if (this.previewEl) {
      // Handle the dragstart event
      this.previewEl.addEventListener('dragstart', (event: DragEvent) => {
        const target = event.target as HTMLElement
        this.draggedItem = target.closest('li')
        if (this.draggedItem) {
          this.draggedItem.classList.add('opacity')
        }
      })

      // Handle the dragend event
      this.previewEl.addEventListener('dragend', (event: DragEvent) => {
        this.resetDraggedItemStyles()
      })

      // Handle the dragover event to allow dropping
      this.previewEl.addEventListener('dragover', (event: DragEvent) => {
        event.preventDefault() // Necessary to allow dropping
      })

      // Handle the drop event
      this.previewEl.addEventListener('drop', (event: DragEvent) => {
        event.preventDefault()

        this.handleReordering(event.target as HTMLElement)
      })

      // Handle the touchstart event
      this.previewEl.addEventListener('touchstart', (event: TouchEvent) => {
        const touch = event.targetTouches[0]
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
        this.draggedItem = target.closest('li')
        if (this.draggedItem) {
          this.draggedItem.classList.add('opacity')
        }
      })

      // Handle the touchmove event
      this.previewEl.addEventListener('touchmove', (event: TouchEvent) => {
        event.preventDefault()
        const touch = event.targetTouches[0]
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
        const targetItem = target.closest('li')
        if (targetItem && this.draggedItem && targetItem !== this.draggedItem) {
          targetItem.classList.add('highlight') // Highlight the potential drop target
        }
      })

      // Handle the touchend event
      this.previewEl.addEventListener('touchend', (event: TouchEvent) => {
        const touch = event.changedTouches[0]
        const target = document.elementFromPoint(touch.clientX, touch.clientY) as HTMLElement
        this.handleReordering(target)
      })
    }
  }

  /**
   * Handles the reordering of the files when dropped in a new position.
   * @param {HTMLElement} target - The drop target element.
   */
  private handleReordering(target: HTMLElement) {
    const targetItem = target.closest('li')
    if (this.previewEl && targetItem && this.draggedItem && targetItem !== this.draggedItem) {
      const oldIndex = Array.from(this.previewEl.children).indexOf(this.draggedItem)
      const newIndex = Array.from(this.previewEl.children).indexOf(targetItem)

      if (oldIndex !== -1 && newIndex !== -1) {
        this.previewEl.insertBefore(this.draggedItem, newIndex > oldIndex ? targetItem.nextSibling : targetItem)
        this.reorderFiles(oldIndex, newIndex)
      }
    }

    this.resetDraggedItemStyles()
    this.clearHighlighting()
  }

  /**
   * Reorders the files array based on the new index.
   * @param {number} oldIndex - The old index of the file.
   * @param {number} newIndex - The new index of the file.
   */
  private reorderFiles(oldIndex: number, newIndex: number) {
    const movedFile = this.files[oldIndex]
    this.files.splice(oldIndex, 1)
    this.files.splice(newIndex, 0, movedFile)

    this.updateInputFiles()
  }

  /**
   * Resets the styles for the dragged item.
   */
  private resetDraggedItemStyles() {
    if (this.draggedItem) {
      this.draggedItem.classList.remove('opacity')
      this.draggedItem = null
    }
  }

  /**
   * Clears any visual highlighting from the preview items.
   */
  private clearHighlighting() {
    if (this.previewEl) {
      Array.from(this.previewEl.children).forEach(item => {
        ;(item as HTMLElement).classList.remove('highlight')
      })
    }
  }
}

export default ImagePreviewHandler
