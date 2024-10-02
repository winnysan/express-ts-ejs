import Editor from './Editor'
import Helper from './Helper'

/**
 * A class to handle form submission and validation.
 */
class FormHandler {
  private formEl: HTMLFormElement | null
  private csrfToken: string | undefined
  private editor?: Editor

  /**
   * Initializes the FormHandler with the form element selector, CSRF token input selector, and optional Editor instance.
   * @param {string} formSelector - The CSS selector for the form element.
   * @param {string} csrfSelector - The CSS selector for the CSRF token input element.
   * @param {Editor} [editor] - An optional instance of the Editor class.
   */
  constructor(formSelector: string, csrfSelector: string, editor?: Editor) {
    this.formEl = Helper.selectElement<HTMLFormElement>(formSelector)
    this.csrfToken = Helper.selectElement<HTMLInputElement>(csrfSelector)?.value
    this.editor = editor

    if (this.formEl) {
      this.initialize()
    }
  }

  /**
   * Sets up the event listener for the form submit event.
   */
  private initialize() {
    this.formEl?.addEventListener('submit', async e => {
      e.preventDefault()
      await this.handleSubmit()
    })

    console.log('The form handler has been initialized')
  }

  /**
   * Handles form submission by collecting form data and images,
   * sending them to the server, and processing the server's response.
   */
  private async handleSubmit() {
    if (this.formEl) {
      const formData = new FormData(this.formEl)

      // Append images present in the content
      if (this.editor) {
        // Update the textarea value with the latest content
        this.editor.updateTextarea()

        // Get the content from the editor
        const content = this.editor.contentEl.value

        // Use a regular expression to find all markdown image syntaxes
        const imageMarkdownRegex = /!\[[^\]]*\]\(([^)]+)\)/g
        let match
        const currentImageNames = new Set<string>()

        // Extract image names from the markdown content
        while ((match = imageMarkdownRegex.exec(content)) !== null) {
          const imageName = match[1] // This is the image name in the markdown syntax
          currentImageNames.add(imageName)
        }

        // Iterate over the editor's images array and append only those present in the content
        this.editor.getImages().forEach(image => {
          if (currentImageNames.has(image.originalName)) {
            // Append the image file to FormData with the original name
            formData.append('images', image.file, image.originalName)
          }
        })
      }

      // Create a toast element for notifications
      let toastEl = Helper.makeToast('#toast')

      // Remove any existing error indicators
      this.formEl.querySelectorAll('.is-error').forEach(element => {
        element.classList.remove('is-error')
      })

      try {
        // Send the form data to the server using Fetch API
        const response = await fetch(this.formEl.action, {
          method: 'POST',
          headers: {
            'x-csrf-token': this.csrfToken || '',
          },
          body: formData,
        })

        if (!response.ok) {
          // If the response is not OK, show a generic failure message
          const result = await response.json()

          let message: string = 'Form submission failed'

          if (result.errors && result.errors[0].msg) message = result.errors[0].msg

          Helper.addToastMessage(toastEl, message, 'danger')
        } else {
          // Parse the JSON response from the server
          const result = await response.json()

          if (result.errors) {
            // If there are validation errors, display them
            result.errors.forEach((error: { msg: string; path?: string }) => {
              Helper.addToastMessage(toastEl, error.msg, 'danger', 3000)

              // Highlight the form field that caused the error
              if (error.path) {
                const inputEl = this.formEl!.querySelector(`[name="${error.path}"]`)

                if (inputEl) {
                  const parentEl = inputEl.closest('div')

                  if (parentEl) parentEl.classList.add('is-error')
                }
              }
            })
          } else {
            // If a redirect URL is provided, navigate to it
            if (result.redirect) window.location.href = result.redirect
            else if (result.json) console.log(result.json)
            // Otherwise, show a generic failure message
            else Helper.addToastMessage(toastEl, 'No action is required', 'warning')
          }
        }
      } catch (err) {
        // Log any unexpected errors to the console
        console.error('Something went wrong:', err)

        Helper.addToastMessage(toastEl, 'Something went wrong', 'danger')
      }
    }
  }
}

export default FormHandler
