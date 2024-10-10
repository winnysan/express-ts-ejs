import dotenv from 'dotenv'
import mongoose from 'mongoose'

async function connect(uri: string) {
  try {
    const conn = await mongoose.connect(uri)

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err: unknown) {
    if (err instanceof Error) console.error(`Error: ${err.message}`)

    process.exit(1)
  }
}

async function seeder() {
  dotenv.config()

  const MONGO_URI = process.env.MONGO_URI!

  await connect(MONGO_URI)

  if (process.argv[2] === '-d') {
    console.log('destroy')

    process.exit()
  } else {
    console.log('import')

    process.exit()
  }
}

seeder()
