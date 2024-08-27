/**
 * Type representing an API response.
 *
 * @typedef {Object} ApiResponse
 * @property {string} message - Message describing the result of the operation.
 * @property {object} [data] - Optional object that may contain additional data returned from the API.
 */
type ApiResponse = {
  message: string
  data?: object
}

/**
 * Client for interacting with an API.
 *
 * @class
 */
export class ApiClient {
  private baseEndpoint: string

  /**
   * Creates a new instance of `ApiClient` with the given base endpoint.
   *
   * @param {string} baseEndpoint - The base API endpoint to be used for all requests.
   */
  constructor(baseEndpoint: string) {
    this.baseEndpoint = baseEndpoint
  }

  /**
   * Sends a POST request to the specified endpoint and returns the API response.
   *
   * @template T - The type of the data being sent in the request.
   * @param {T} data - The data to be sent to the server.
   * @param {string} endpoint - The target endpoint on the server to which the request is sent.
   * @returns {Promise<ApiResponse>} - A promise that resolves to the `ApiResponse` type.
   * @throws {Error} - Throws an error if there is an issue with sending the request or processing the response.
   */
  async fetch<T>(data: T, endpoint: string): Promise<ApiResponse> {
    try {
      const response = await fetch(`${this.baseEndpoint}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data }),
      })

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      return response.json() as Promise<ApiResponse>
    } catch (error) {
      throw error
    }
  }
}
