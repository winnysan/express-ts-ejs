import mongoose from 'mongoose'
import Logger from './Logger'
import Message from './Message'

class Database {
  private uri: string

  constructor(uri: string) {
    this.uri = uri
  }

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
