import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import path from 'path'
import connectDB from './lib/connectDB'
import { errorHandler, notFound } from './middleware/errorMiddleware'
import localizationMiddleware from './middleware/localizationMiddleware'
import adminRouter from './routes/adminRoute'
import dashboardRouter from './routes/dashboardRoute'
import publicRouter from './routes/publicRoute'

dotenv.config()

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI!

connectDB(MONGO_URI)

const app = express()

// Body parser middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// Cookie parser middleware
app.use(cookieParser())

// Localization
app.use(localizationMiddleware)

// Public folder
app.use(express.static(path.join(__dirname, 'public')))

// View engine
app.use(expressLayouts)
app.set('layout', 'layouts/main')
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

// Routes
app.use('/', publicRouter)
app.use('/dashboard', dashboardRouter)
app.use('/admin', adminRouter)

// Errors
app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`App running on http://localhost:${PORT}`)
})
