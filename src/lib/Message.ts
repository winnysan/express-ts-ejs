class Message {
  /**
   * Get error message
   * @param error
   * @returns message
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
