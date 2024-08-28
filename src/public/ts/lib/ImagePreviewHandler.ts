import Helper from './Helper'

/**
 * A class to handle image preview functionality.
 */
class ImagePreviewHandler {
  private inputEl: HTMLInputElement | null
  private previewEl: HTMLDivElement | null
  private files: File[] = []

  /**
   * Initializes the ImagePreviewHandler with the image input and preview container selectors.
   * @param {string} inputSelector - The CSS selector for the image input element.
   * @param {string} previewSelector - The CSS selector for the image preview container element.
   */
  constructor(inputSelector: string, previewSelector: string) {
    this.inputEl = Helper.selectElement<HTMLInputElement>(inputSelector)
    this.previewEl = Helper.selectElement<HTMLDivElement>(previewSelector)

    if (this.inputEl && this.previewEl) {
      this.initialize()
    }
  }

  /**
   * Sets up the event listener for the image input change event.
   */
  private initialize() {
    this.inputEl?.addEventListener('change', e => this.handleImageChange(e))
    console.log('The image preview handler has been initialized')
  }

  /**
   * Handles the image input change event and generates the image previews.
   * @param {Event} event - The change event triggered by the image input.
   */
  private handleImageChange(event: Event) {
    const input = event.target as HTMLInputElement
    const files = input.files

    if (files && this.previewEl) {
      this.previewEl.innerHTML = ''
      this.files = Array.from(files)

      this.files.forEach((file, index) => {
        if (file && file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = e => this.displayImage(e, index)
          reader.readAsDataURL(file)
        }
      })
    }
  }

  /**
   * Displays the image preview with a remove button.
   * @param {ProgressEvent<FileReader>} event - The file reader load event containing the image data.
   * @param {number} index - The index of the image in the file list.
   */
  private displayImage(event: ProgressEvent<FileReader>, index: number) {
    const imgContainer = document.createElement('div')
    imgContainer.style.position = 'relative'

    const imgEl = document.createElement('img')
    imgEl.src = event.target?.result as string
    imgEl.style.display = 'block'
    imgEl.style.marginBottom = '10px'

    const removeBtn = document.createElement('button')
    removeBtn.textContent = 'Remove'
    removeBtn.style.position = 'absolute'
    removeBtn.style.top = '10px'
    removeBtn.style.right = '10px'
    removeBtn.addEventListener('click', () => this.removeImage(index))

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
