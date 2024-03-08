import fs from 'fs'
import getErrorMessage from './getErrorMessage'

/**
 * Log to file
 * @param message
 */
const logToFile = (message: unknown) => {
  try {
    const errorMessage = getErrorMessage(message)

    const date = new Date()
    const time = date.toLocaleTimeString('sk-SK') + '.' + date.getMilliseconds()
    const day =
      ('0' + new Date().getDate()).slice(-2) +
      '-' +
      ('0' + (new Date().getMonth() + 1)).slice(-2) +
      '-' +
      date.getFullYear()

    const data = `${time} | ${errorMessage}\n`

    fs.writeFileSync(`logs/${day}.txt`, data, { flag: 'a' })
  } catch (err: unknown) {
    console.error('logToFile', getErrorMessage(err))
  }
}

export default logToFile
