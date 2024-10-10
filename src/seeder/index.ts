import { fakerSK as faker } from '@faker-js/faker'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Post from '../models/Post'
import User from '../models/User'
import { Role } from '../types/enums'

/**
 * Connect
 */
async function connect(uri: string) {
  try {
    const conn = await mongoose.connect(uri)

    console.log(`MongoDB Connected: ${conn.connection.host}`)
  } catch (err: unknown) {
    if (err instanceof Error) console.error(`Error: ${err.message}`)

    process.exit(1)
  }
}

/**
 * Seeder
 */
async function seeder() {
  dotenv.config()

  const MONGO_URI = process.env.MONGO_URI!

  await connect(MONGO_URI)

  if (process.argv[2] === '-d') {
    await destroyData()
  } else {
    await importData()
  }
}

/**
 * Create random user
 */
function createRandomUser(user?: unknown) {
  const validatedUser = user as { name?: string; email?: string; role?: Role } | undefined

  return {
    name: validatedUser?.name || faker.person.fullName(),
    email: validatedUser?.email || faker.internet.email().toLowerCase(),
    password: '$2a$10$soM5aE9lT9Io5yB0K9H8BOciioPDYkZ7FHX93uJkJ3vA3m4RuD43q',
    role: validatedUser?.role || Role.USER,
  }
}

async function destroyData() {
  await User.deleteMany()
  await Post.deleteMany()

  console.log('Data destroyed')

  process.exit()
}

/**
 * Import data
 */
async function importData() {
  const usersFaker = faker.helpers.multiple(createRandomUser, {
    count: 50,
  })

  usersFaker.unshift(
    createRandomUser({ name: 'Admin', email: 'admin@example.com', role: Role.ADMIN }),
    createRandomUser({ name: 'Marek', email: 'marek@example.com', role: Role.USER })
  )

  const users = await User.create(usersFaker)

  console.log(users)

  console.log('Data imported')

  process.exit()
}

/**
 * seeder()
 */
seeder()
