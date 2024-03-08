import dotenv from 'dotenv'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import path from 'path'
import connectDB from './lib/connectDB'
import { errorHandler, notFound } from './middleware/errorMiddleware'

dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI!

connectDB(MONGO_URI)

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

// View engine
app.use(expressLayouts)
app.set('layout', 'layouts/main')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Routes
app.get('/', (req: express.Request, res: express.Response) => {
  res.render('index')
})

// Errors
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`)
})
