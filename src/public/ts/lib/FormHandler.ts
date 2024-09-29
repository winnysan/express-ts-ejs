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

      // Collect current images present in the editor's content
      if (this.editor) {
        // Select all <img> elements within the editor's content
        const imgElements = this.editor.contentEl.querySelectorAll('img')

        // Create a Set to store unique original names of images present in the content
        const currentImageNames = new Set<string>()

        imgElements.forEach(img => {
          const originalName = img.getAttribute('data-image')
          if (originalName) {
            currentImageNames.add(originalName)
          }
        })

        // Iterate over the editor's images array and append only those present in the content
        this.editor.getImages().forEach(image => {
          if (currentImageNames.has(image.originalName)) {
            // Append the image file to FormData with the original name
            formData.append('images', image.file, image.originalName)
          }
        })
      }

      try {
        // Send the form data to the server using Fetch API
        const response = await fetch(this.formEl.action, {
          method: 'POST',
          headers: {
            'x-csrf-token': this.csrfToken || '',
          },
          body: formData,
        })

        // Create a toast element for notifications
        let toastEl = Helper.makeToast('#toast')

        // Remove any existing error indicators
        this.formEl.querySelectorAll('.is-error').forEach(element => {
          element.classList.remove('is-error')
        })

        if (!response.ok) {
          // If the response is not OK, show a generic failure message
          Helper.addToastMessage(toastEl, 'Form submission failed', 'danger')
        } else {
          // Parse the JSON response from the server
          const result = await response.json()

          if (result.errors) {
            // If there are validation errors, display them
            result.errors.forEach((error: { msg: string; path: string }) => {
              Helper.addToastMessage(toastEl, error.msg, 'danger', 3000)

              // Highlight the form field that caused the error
              const inputEl = this.formEl!.querySelector(`[name="${error.path}"]`)
              if (inputEl) {
                const parentEl = inputEl.closest('div')
                if (parentEl) {
                  parentEl.classList.add('is-error')
                }
              }
            })
          } else {
            if (result.redirect) {
              // If a redirect URL is provided, navigate to it
              window.location.href = result.redirect
            } else if (result.json) {
              console.log(result.json)
            } else {
              // Otherwise, show a generic failure message
              Helper.addToastMessage(toastEl, 'Form submission failed', 'danger')
            }
          }
        }
      } catch (error) {
        // Log any unexpected errors to the console
        console.error('An error occurred:', error)
      }
    }
  }
}

export default FormHandler
