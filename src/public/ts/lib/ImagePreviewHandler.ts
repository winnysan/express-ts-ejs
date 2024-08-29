import Helper from './Helper'

/**
 * A class to handle image preview functionality with drag-and-drop support.
 */
class ImagePreviewHandler {
  private inputEl: HTMLInputElement | null
  private previewEl: HTMLDivElement | null
  private dropAreaEl: HTMLLabelElement | null
  private files: File[] = []

  /**
   * Initializes the ImagePreviewHandler with the image input, preview container, and drop area selectors.
   * @param {string} inputSelector - The CSS selector for the image input element.
   * @param {string} previewSelector - The CSS selector for the image preview container element.
   * @param {string} dropAreaSelector - The CSS selector for the drop area element.
   */
  constructor(inputSelector: string, previewSelector: string, dropAreaSelector: string) {
    this.inputEl = Helper.selectElement<HTMLInputElement>(inputSelector)
    this.previewEl = Helper.selectElement<HTMLDivElement>(previewSelector)
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
    const imgContainer = document.createElement('div')
    imgContainer.classList.add('preview-images__image-container')

    const imgEl = document.createElement('img')
    imgEl.src = event.target?.result as string
    imgEl.classList.add('preview-images__image')

    const removeBtn = document.createElement('button')
    removeBtn.textContent = 'Remove'
    removeBtn.classList.add('preview-image__remove-button')

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
    }
  }
}

export default ImagePreviewHandler
