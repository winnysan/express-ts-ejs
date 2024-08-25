/**
 * A class responsible for handling and formatting error messages.
 */
class Message {
  /**
   * Extracts a human-readable error message from an unknown error.
   * @param error - The error from which to extract the message. Can be of type `Error`, an object with a `message` property, a string, or any other type.
   * @returns {string} A formatted error message. If the error cannot be determined or is not recognized, a default error message is returned.
   * @description This method attempts to determine the error message based on the type of the provided `error` parameter.
   * It handles `Error` objects, objects with a `message` property, strings, and falls back to a default error message if the error is unrecognized or cannot be converted to a string.
   */
  public getErrorMessage(error: unknown): string {
    let message: string

    if (error instanceof Error) {
      message = error.message
    } else if (error && typeof error === 'object' && 'message' in error) {
      message = String((error as { message: unknown }).message)
    } else if (typeof error === 'string') {
      message = error
    } else {
      message = global.dictionary.messages.somethingWentWrong
    }

    return message
  }
}

export default new Message()
