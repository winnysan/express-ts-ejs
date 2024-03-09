import mongoose from 'mongoose'
import getErrorMessage from './getErrorMessage'
import logToFile from './logToFile'

/**
 * Connect to database
 * @param uri
 */
const connectDB = async (uri: string) => {
  try {
    const conn = await mongoose.connect(uri)
    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err: unknown) {
    logToFile(getErrorMessage(err))
    process.exit(1)
  }
}

export default connectDB
