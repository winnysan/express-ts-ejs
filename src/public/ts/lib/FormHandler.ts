import Helper from './Helper'

/**
 * A class to handle form submission and validation.
 */
class FormHandler {
  private formEl: HTMLFormElement | null
  private csrfToken: string | undefined

  /**
   * Initializes the FormHandler with the form element selector and CSRF token input selector.
   * @param {string} formSelector - The CSS selector for the form element.
   * @param {string} csrfSelector - The CSS selector for the CSRF token input element.
   */
  constructor(formSelector: string, csrfSelector: string) {
    this.formEl = Helper.selectElement<HTMLFormElement>(formSelector)
    this.csrfToken = Helper.selectElement<HTMLInputElement>(csrfSelector)?.value

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
   * Handles form submission by sending data to the server and processing the response.
   */
  private async handleSubmit() {
    if (this.formEl) {
      const formData = new FormData(this.formEl)

      try {
        const response = await fetch(this.formEl.action, {
          method: 'POST',
          headers: {
            'x-csrf-token': this.csrfToken || '',
          },
          body: formData,
        })

        let errorsEl = Helper.selectElement<HTMLUListElement>('#errors')
        if (!errorsEl) {
          errorsEl = document.createElement('ul')
          errorsEl.id = 'errors'
          this.formEl.before(errorsEl)
        }
        errorsEl.innerHTML = ''

        if (!response.ok) {
          Helper.addErrorMessage(errorsEl, 'Form submission failed')
        } else {
          const result = await response.json()
          if (result.errors) {
            result.errors.forEach((error: { msg: string }) => {
              Helper.addErrorMessage(errorsEl, error.msg)
            })
          } else {
            if (result.slug) {
              window.location.href = `/post/${result.slug}`
            } else {
              Helper.addErrorMessage(errorsEl, 'Form submission failed')
            }
          }
        }
      } catch (error) {
        console.error('An error occurred:', error)
      }
    }
  }
}

export default FormHandler
