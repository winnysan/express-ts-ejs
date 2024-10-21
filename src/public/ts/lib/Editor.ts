/**
 * A simple markdown editor class that replaces a textarea element.
 * Supports headings (levels 1-3), paragraphs, and image insertion.
 */
class Editor {
  private formEl!: HTMLFormElement
  private editorEl: HTMLDivElement = document.createElement('div')
  private toolbarEl: HTMLDivElement = document.createElement('div')
  public contentEl: HTMLTextAreaElement = document.createElement('textarea')
  private inputEl!: HTMLTextAreaElement
  private images: { originalName: string; file: File }[] = []

  /**
   * Factory method to create an instance of Editor.
   * Returns undefined if the form does not have the data-form="editor" attribute.
   * @param {string} formSelector - CSS selector for the form element.
   * @returns {Editor | undefined} An instance of Editor or undefined.
   */
  static create(formSelector: string): Editor | undefined {
    const form = document.querySelector(formSelector)
    if (form) {
      if (form.getAttribute('data-form') !== 'editor') {
        return undefined // Returns undefined if the form does not have the correct attribute
      }

      return new Editor(formSelector)
    }
    return undefined
  }

  // Set the constructor to private to prevent direct instantiation
  private constructor(formSelector: string) {
    // No longer need to check for the data-form attribute; that was done in the create method
    this.formEl = document.querySelector(formSelector) as HTMLFormElement

    // Find the textarea element within the form.
    const textarea = this.formEl.querySelector<HTMLTextAreaElement>('textarea[name="body"]')
    if (textarea) {
      this.inputEl = textarea

      // Initialize the editor.
      this.initialize()
    }
  }

  /**
   * Sets up the editor interface and event listeners.
   */
  private initialize() {
    // Hide the original textarea.
    this.inputEl.style.display = 'none'

    // Add classes for styling.
    this.editorEl.classList.add('editor')
    this.toolbarEl.classList.add('toolbar')
    this.contentEl.classList.add('content')

    // Set the content of the textarea.
    this.contentEl.value = this.inputEl.value

    // Set styles for the textarea.
    // this.contentEl.style.width = '100% - 4px'
    // this.contentEl.style.height = '300px'

    // Create toolbar buttons and add event listeners.
    this.createToolbarButtons()
    this.addEventListeners()

    // Assemble the editor.
    this.editorEl.appendChild(this.toolbarEl)
    this.editorEl.appendChild(this.contentEl)
    this.inputEl.parentNode!.insertBefore(this.editorEl, this.inputEl)

    // Update the textarea value on form submission.
    this.formEl.addEventListener('submit', () => {
      this.inputEl.value = this.contentEl.value
    })

    console.log(window.localization.getLocalizedText('markdownEditorHasBeenInitialized'))
  }

  /**
   * Creates toolbar buttons for the editor.
   */
  private createToolbarButtons() {
    // Define the buttons with their commands and display text.
    const buttons = [
      { command: 'heading2', text: 'H2' },
      { command: 'heading3', text: 'H3' },
      { command: 'paragraph', text: 'P' },
      { command: 'insertImage', text: 'Image' },
    ]

    // Create each button and add it to the toolbar.
    buttons.forEach(btn => {
      const button = document.createElement('button')
      button.type = 'button'
      button.textContent = btn.text
      button.dataset.command = btn.command
      this.toolbarEl.appendChild(button)
    })
  }

  /**
   * Adds event listeners to the toolbar and content.
   */
  private addEventListeners() {
    // Handle clicks on the toolbar buttons.
    this.toolbarEl.addEventListener('click', e => {
      const target = e.target as HTMLButtonElement
      if (target.dataset.command) {
        this.executeCommand(target.dataset.command)
      }
    })

    // Update the textarea value when the content changes.
    this.contentEl.addEventListener('input', () => {
      this.inputEl.value = this.contentEl.value
    })
  }

  /**
   * Executes editor commands based on the command string.
   * @param {string} command - The command to execute.
   */
  private executeCommand(command: string) {
    switch (command) {
      case 'heading2':
        this.insertHeading('## ')
        break
      case 'heading3':
        this.insertHeading('### ')
        break
      case 'paragraph':
        this.insertParagraph()
        break
      case 'insertImage':
        this.insertImage()
        break
    }
  }

  /**
   * Inserts markdown syntax for a heading at the beginning of the current line.
   * @param {string} markdown - The markdown syntax for the heading to insert.
   */
  private insertHeading(markdown: string) {
    const selectionStart = this.contentEl.selectionStart
    const selectionEnd = this.contentEl.selectionEnd

    // Get text before and after the selection.
    const textBefore = this.contentEl.value.substring(0, selectionStart)
    const textAfter = this.contentEl.value.substring(selectionEnd)

    // Find the start of the current line.
    const lineStart = textBefore.lastIndexOf('\n') + 1
    const currentLine = this.contentEl.value.substring(lineStart, selectionEnd)

    // Remove existing heading syntax.
    const currentLineWithoutHeading = currentLine.replace(/^#+\s*/, '')

    // Insert markdown heading.
    const newLine = markdown + currentLineWithoutHeading

    // Update content.
    const newText = this.contentEl.value.substring(0, lineStart) + newLine + textAfter
    this.contentEl.value = newText

    // Set cursor position.
    const newCursorPos = lineStart + newLine.length
    this.contentEl.selectionStart = this.contentEl.selectionEnd = newCursorPos

    // Dispatch 'input' event to update hidden textarea.
    this.contentEl.dispatchEvent(new Event('input'))
  }

  /**
   * Inserts a paragraph (new line) at the current cursor position.
   */
  private insertParagraph() {
    const selectionStart = this.contentEl.selectionStart
    const selectionEnd = this.contentEl.selectionEnd

    // Insert double newline for a paragraph.
    const textBefore = this.contentEl.value.substring(0, selectionStart)
    const textAfter = this.contentEl.value.substring(selectionEnd)
    const newText = textBefore + '\n\n' + textAfter
    this.contentEl.value = newText

    // Set cursor position.
    const newCursorPos = selectionStart + 2
    this.contentEl.selectionStart = this.contentEl.selectionEnd = newCursorPos

    // Dispatch 'input' event to update hidden textarea.
    this.contentEl.dispatchEvent(new Event('input'))
  }

  /**
   * Handles image insertion into the editor.
   */
  private insertImage() {
    // Create a file input element to select an image.
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = () => {
      const file = input.files![0]
      if (file) {
        const originalName = file.name
        // Store the image file and its original name.
        this.images.push({ originalName, file })

        // Insert markdown syntax for the image at the cursor position.
        const selectionStart = this.contentEl.selectionStart
        const selectionEnd = this.contentEl.selectionEnd

        const textBefore = this.contentEl.value.substring(0, selectionStart)
        const textAfter = this.contentEl.value.substring(selectionEnd)
        const imageMarkdown = `![${originalName}](${originalName})`

        // Update content.
        this.contentEl.value = textBefore + imageMarkdown + textAfter

        // Set cursor position.
        const newCursorPos = selectionStart + imageMarkdown.length
        this.contentEl.selectionStart = this.contentEl.selectionEnd = newCursorPos

        // Dispatch 'input' event to update hidden textarea.
        this.contentEl.dispatchEvent(new Event('input'))
      }
    }
    // Trigger the file input dialog.
    input.click()
  }

  /**
   * Updates the hidden textarea with the current content of the editor.
   */
  public updateTextarea() {
    this.inputEl.value = this.contentEl.value
  }

  /**
   * Retrieves the list of images inserted into the editor.
   * @returns {Array} Array of image objects.
   */
  public getImages() {
    return this.images
  }
}

export default Editor
