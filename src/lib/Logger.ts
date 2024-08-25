import fs from 'fs'
import Message from './Message'

/**
 * A class responsible for logging messages to a file.
 * Provides methods for writing log messages to a file with timestamps and locale information.
 */
class Logger {
  /**
   * Logs a message to a file.
   * @param message - The message to log. Can be of any type.
   * @returns {void}
   * @description This method formats the provided message, including a timestamp and locale information,
   * and appends it to a log file named by the current date. The log file is stored in the `logs` directory.
   * If an error occurs while writing to the file, it logs the error to the console.
   */
  public logToFile(message: unknown): void {
    try {
      // Convert the message to a string using a helper method
      const errorMessage = Message.getErrorMessage(message)

      // Get current date and time information
      const date = new Date()
      const time = date.toLocaleTimeString(global.locale) + '.' + date.getMilliseconds()
      const day =
        ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear()

      // Format the log entry
      const data = `${time} | ${global.locale} | ${errorMessage}\n`

      // Write the log entry to the file
      fs.writeFileSync(`logs/${day}.txt`, data, { flag: 'a' })
    } catch (err: unknown) {
      // Log errors that occur during the logging process to the console
      console.error('logToFile', Message.getErrorMessage(err))
    }
  }
}

export default new Logger()
