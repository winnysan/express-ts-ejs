import ApiClient from './lib/ApiCLient'
import Carousel from './lib/Carousel'
import FormHandler from './lib/FormHandler'
import Helper from './lib/Helper'
import ImagePreviewHandler from './lib/ImagePreviewHandler'
import './lib/Layout'
import './reactivity'

console.log(
  '%cScript loaded successfully',
  'color: white; background-color: green; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
)

/**
 * Initialize color mode switcher
 */
Helper.colorModeSwitcher()

/**
 * Initialize FormHandler and ImagePreviewHandler
 */
new FormHandler('#form', 'input[name="_csrf"]')
new ImagePreviewHandler('#input-images', '#preview-images', '#drop-area')

/**
 * Initialize Carousel
 */

new Carousel('#carousel', 3)

/**
 * Fetch
 */
const apiClient = new ApiClient('http://localhost:7000/api')

const fetchButton = Helper.selectElement<HTMLSpanElement>('#fetchButton')

fetchButton?.addEventListener('click', () => {
  apiClient
    .fetch<string>('Hello', 'hello')
    .then(response => {
      console.log('message:', response.message)
      if (response.data) {
        alert(response.data)
      }
    })
    .catch(error => console.error(error))
})
