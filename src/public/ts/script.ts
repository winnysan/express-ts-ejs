import { ApiClient } from './lib/ApiCLient'
import { selectElement } from './lib/utils'
import './reactivity'

console.log(
  '%cScript loaded successfully',
  'color: white; background-color: green; font-weight: bold; padding: 2px 4px; border-radius: 3px;'
)

const dateEl = selectElement<HTMLSpanElement>('#date')

if (dateEl) dateEl.innerText = new Date().toLocaleDateString()

/**
 * Fetch
 */
const apiClient = new ApiClient('http://localhost:7000/api')

const fetchButton = selectElement<HTMLSpanElement>('#fetchButton')

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
