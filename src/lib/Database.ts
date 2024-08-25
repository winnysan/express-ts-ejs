import mongoose from 'mongoose'
import Logger from './Logger'
import Message from './Message'

/**
 * A class responsible for connecting to the MongoDB database.
 * Manages the connection to the database using Mongoose and handles errors.
 */
class Database {
  /**
   * The URI used to connect to the MongoDB database.
   * @private
   */
  private uri: string

  /**
   * Creates an instance of the Database class.
   * @param uri - The URI for connecting to the MongoDB database.
   */
  constructor(uri: string) {
    this.uri = uri
  }

  /**
   * Connects to the MongoDB database using the provided URI.
   * @returns A promise that resolves when the connection is successful.
   * @throws Will log an error and terminate the process if the connection fails.
   * @description This method attempts to connect to the MongoDB database using Mongoose.
   * If the connection is successful, it logs the connection host to the console.
   * If an error occurs during connection, it logs the error message to a file and
   * terminates the process with a non-zero exit code.
   */
  public async connect(): Promise<void> {
    try {
      const conn = await mongoose.connect(this.uri)
      console.log(`MongoDB Connected: ${conn.connection.host}`)
    } catch (err: unknown) {
      Logger.logToFile(Message.getErrorMessage(err))
      process.exit(1)
    }
  }
}

export default Database
