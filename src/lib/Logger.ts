import fs from 'fs'
import Message from './Message'

class Logger {
  /**
   * Log to file
   * @param message
   */
  public logToFile(message: unknown): void {
    try {
      const errorMessage = Message.getErrorMessage(message)

      const date = new Date()
      const time = date.toLocaleTimeString(global.locale) + '.' + date.getMilliseconds()
      const day =
        ('0' + date.getDate()).slice(-2) + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + date.getFullYear()

      const data = `${time} | ${global.locale} | ${errorMessage}\n`

      fs.writeFileSync(`logs/${day}.txt`, data, { flag: 'a' })
    } catch (err: unknown) {
      console.error('logToFile', Message.getErrorMessage(err))
    }
  }
}

export default new Logger()
