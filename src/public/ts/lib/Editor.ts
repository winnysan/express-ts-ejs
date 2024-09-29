/**
 * A simple text editor class that replaces a textarea element.
 * Supports headings (levels 1-3), paragraphs, and image insertion.
 */
class Editor {
  private formEl!: HTMLFormElement
  private editorEl: HTMLDivElement = document.createElement('div')
  private toolbarEl: HTMLDivElement = document.createElement('div')
  public contentEl: HTMLDivElement = document.createElement('div')
  private inputEl!: HTMLTextAreaElement
  private images: { originalName: string; file: File }[] = []

  /**
   * Initializes the Editor.
   * @param {string} formSelector - CSS selector for the form element.
   */
  constructor(formSelector: string) {
    // Select the form element using the provided selector.
    const form = document.querySelector(formSelector)
    if (form) {
      // Check if the form has the data-name attribute set to 'editor'
      if (form.getAttribute('data-form') !== 'editor') {
        return // Skip initialization if the form does not have the correct data-name attribute
      }

      this.formEl = form as HTMLFormElement

      // Find the textarea element within the form.
      const textarea = this.formEl.querySelector<HTMLTextAreaElement>('textarea[name="body"]')
      if (textarea) {
        this.inputEl = textarea

        // Initialize the editor.
        this.initialize()
      }
    }
  }

  /**
   * Sets up the editor interface and event listeners.
   */
  private initialize() {
    // Hide the original textarea.
    this.inputEl.style.display = 'none'

    // Add classes to the editor elements for styling.
    this.editorEl.classList.add('editor')
    this.toolbarEl.classList.add('toolbar')
    this.contentEl.classList.add('content')

    // Make the content element editable.
    this.contentEl.contentEditable = 'true'

    // Load existing content from the textarea into the editor.
    this.contentEl.innerHTML = this.inputEl.value

    // Set the default paragraph separator to <p>.
    document.execCommand('defaultParagraphSeparator', false, 'p')

    // Create toolbar buttons and add event listeners.
    this.createToolbarButtons()
    this.addEventListeners()

    // Assemble the editor elements.
    this.editorEl.appendChild(this.toolbarEl)
    this.editorEl.appendChild(this.contentEl)
    this.inputEl.parentNode!.insertBefore(this.editorEl, this.inputEl)

    // Update the textarea value when the form is submitted.
    this.formEl.addEventListener('submit', () => {
      const images = this.contentEl.querySelectorAll('img')
      images.forEach(img => {
        const originalName = img.getAttribute('data-image')
        if (originalName) {
          img.setAttribute('src', originalName)
        }
      })
      this.inputEl.value = this.contentEl.innerHTML
    })

    console.log('The text editor has been initialized')
  }

  /**
   * Creates toolbar buttons for the editor.
   */
  private createToolbarButtons() {
    // Define the buttons with their commands and display text.
    const buttons = [
      { command: 'heading1', text: 'H1' },
      { command: 'heading2', text: 'H2' },
      { command: 'heading3', text: 'H3' },
      { command: 'paragraph', text: 'P' },
      { command: 'insertImage', text: 'Obrázok' },
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
   * Adds event listeners to the toolbar and content elements.
   */
  private addEventListeners() {
    // Handle toolbar button clicks.
    this.toolbarEl.addEventListener('click', e => {
      const target = e.target as HTMLButtonElement
      if (target.dataset.command) {
        this.executeCommand(target.dataset.command)
      }
    })

    // Update the textarea value when the content changes.
    this.contentEl.addEventListener('input', () => {
      this.inputEl.value = this.contentEl.innerHTML
    })
  }

  /**
   * Executes editor commands based on the command string.
   * @param {string} command - The command to execute.
   */
  private executeCommand(command: string) {
    switch (command) {
      case 'heading1':
        // Format selected text as heading level 1.
        document.execCommand('formatBlock', false, 'h1')
        break
      case 'heading2':
        // Format selected text as heading level 2.
        document.execCommand('formatBlock', false, 'h2')
        break
      case 'heading3':
        // Format selected text as heading level 3.
        document.execCommand('formatBlock', false, 'h3')
        break
      case 'paragraph':
        // Format selected text as paragraph.
        document.execCommand('formatBlock', false, 'p')
        break
      case 'insertImage':
        // Insert an image at the cursor position.
        this.insertImage()
        break
    }
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

        // Create an image element for display in the editor.
        const img = document.createElement('img')
        img.src = URL.createObjectURL(file)
        img.alt = originalName
        img.setAttribute('data-image', originalName)
        // Insert the image at the cursor position.
        this.insertNodeAtCursor(img)
      }
    }
    // Trigger the file input dialog.
    input.click()
  }

  /**
   * Inserts a node at the current cursor position.
   * @param {Node} node - The node to insert.
   */
  private insertNodeAtCursor(node: Node) {
    const sel = window.getSelection()
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(node)
      range.collapse(false)
    } else {
      // If no selection, append the node at the end.
      this.contentEl.appendChild(node)
    }
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
