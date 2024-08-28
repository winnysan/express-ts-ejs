import ApiClient from './lib/ApiCLient'
import FormHandler from './lib/FormHandler'
import Helper from './lib/Helper'
import ImagePreviewHandler from './lib/ImagePreviewHandler'
import './reactivity'

console.log(
  '%cScript loaded successfully',
  'color: white; background-color: green; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
)

/**
 * Initialize the FormHandler and ImagePreviewHandler
 */
new FormHandler('#form', 'input[name="_csrf"]')
new ImagePreviewHandler('#input-images', '#preview-images')

/**
 * Set year to footer
 */
const dateEl = Helper.selectElement<HTMLSpanElement>('#date')

if (dateEl) dateEl.innerText = new Date().toLocaleDateString()

/**
 * Fetch
 */
const apiClient = new ApiClient('http://localhost:7000/api')

const fetchButton = Helper.selectElement<HTMLSpanElement>('#fetchButton')

fetchButton?.addEventListener('click', () => {
  apiClient
    .fetch<string>('Hello from frontend', 'hello')
    .then(response => {
      console.log('message:', response.message)
      if (response.data) {
        alert(response.data)
      }
    })
    .catch(error => console.error(error))
})
