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

        let toastEl = Helper.makeToast('#toast')

        this.formEl.querySelectorAll('.is-error').forEach(element => {
          element.classList.remove('is-error')
        })

        if (!response.ok) {
          Helper.addToastMessage(toastEl, 'Form submission failed', 'danger')
        } else {
          const result = await response.json()

          if (result.errors) {
            result.errors.forEach((error: { msg: string; path: string }) => {
              Helper.addToastMessage(toastEl, error.msg, 'danger', 3000)

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
              window.location.href = result.redirect
            } else {
              Helper.addToastMessage(toastEl, 'Form submission failed', 'danger')
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
