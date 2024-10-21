/**
 * Type representing the response from the API.
 *
 * @typedef {Object} ApiResponse
 * @property {string} message - Message describing the result of the operation.
 * @property {object} [data] - Optional object that may contain additional data from the API.
 */
export type ApiResponse = {
  message: string
  data?: object
}

/**
 * Client for interacting with the API.
 *
 * @class
 * @template TResponse - Type of the response from the API.
 */
class ApiClient<TResponse = ApiResponse> {
  private baseEndpoint: string

  /**
   * Creates a new instance of `ApiClient` with the given base endpoint.
   *
   * @param {string} baseEndpoint - The base API endpoint for all requests.
   */
  constructor(baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint
  }

  /**
   * Retrieves the CSRF token from the server.
   *
   * @returns {Promise<string>} - A promise that resolves to a string containing the CSRF token.
   * @throws {Error} - Throws an error if there is an issue with the request.
   */
  private async getCsrfToken(): Promise<string> {
    try {
      const response = await fetch(`${this.baseEndpoint}/csrf-token`, {
        method: 'GET',
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()
      if (!data.csrfToken) {
        throw new Error(window.localization.getLocalizedText('csrfTokenNotFoundInTheResponse'))
      }

      return data.csrfToken
    } catch (error) {
      throw error
    }
  }

  /**
   * Sends a POST request to the specified endpoint with CSRF protection and returns the response from the API.
   *
   * @template U - Type of data being sent in the request.
   * @param {U} data - The data to be sent to the server.
   * @param {string} endpoint - The target endpoint on the server where the request is sent.
   * @returns {Promise<TResponse>} - A promise that resolves to the type `TResponse`.
   * @throws {Error} - Throws an error if there is an issue with sending the request or processing the response.
   */
  async fetch<U>(data: U, endpoint: string): Promise<TResponse> {
    try {
      const csrfToken = await this.getCsrfToken()

      const response = await fetch(`${this.baseEndpoint}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken,
        },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        throw new Error(`${window.localization.getLocalizedText('error')}: ${response.statusText}`)
      }

      return response.json() as Promise<TResponse>
    } catch (error) {
      throw error
    }
  }
}

export default ApiClient
