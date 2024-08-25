import mongoose from 'mongoose'
import Logger from './Logger'
import Message from './Message'

/**
 * Connect to database
 * @param uri
 */
const connectDB = async (uri: string) => {
  try {
    const conn = await mongoose.connect(uri)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err: unknown) {
    Logger.logToFile(Message.getErrorMessage(err))
    process.exit(1)
  }
}

export default connectDB
