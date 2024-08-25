import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import flash from 'express-flash'
import session from 'express-session'
import path from 'path'
import connectDB from './lib/connectDB'
import AuthMiddleware from './middleware/AuthMiddleware'
import ErrorMiddleware from './middleware/ErrorMiddleware'
import LocalizationMiddleware from './middleware/LocalizationMiddleware'
import adminRouter from './routes/adminRoute'
import dashboardRouter from './routes/dashboardRoute'
import publicRouter from './routes/publicRoute'

dotenv.config()

class App {
  public app: express.Application
  private PORT: number | undefined
  private MONGO_URI: string

  constructor() {
    this.app = express()
    this.PORT = process.env.PORT
    this.MONGO_URI = process.env.MONGO_URI

    this.connectDatabase()
    this.setMiddlewares()
    this.setViewEngine()
    this.setRoutes()
    this.setErrorHandlers()
  }

  /**
   * Database connection
   */
  private connectDatabase(): void {
    connectDB(this.MONGO_URI)
  }

  /**
   * Set middlewares
   */
  private setMiddlewares(): void {
    // Body parser middleware
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))

    // Cookie parser middleware
    this.app.use(cookieParser())

    // Session middleware
    this.app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
      })
    )

    // Flash messages
    this.app.use(flash())

    // Localization
    this.app.use(LocalizationMiddleware.use)

    // Public folder
    this.app.use(express.static(path.join(__dirname, './public')))
  }

  /**
   * Set view engine
   */
  private setViewEngine(): void {
    this.app.use(expressLayouts)
    this.app.set('layout', 'layouts/main')
    this.app.set('view engine', 'ejs')
    this.app.set('views', path.join(__dirname, 'views'))
  }

  /**
   * Set routes
   */
  private setRoutes(): void {
    this.app.use('/', AuthMiddleware.authCheck, publicRouter)
    this.app.use('/dashboard', AuthMiddleware.authCheck, dashboardRouter)
    this.app.use('/admin', AuthMiddleware.authCheck, adminRouter)
  }

  /**
   * Set error handlers
   */
  private setErrorHandlers(): void {
    this.app.use(ErrorMiddleware.notFound)
    this.app.use(ErrorMiddleware.errorHandler)
  }

  /**
   * Start application
   */
  public start(): void {
    this.app.listen(this.PORT, () => {
      console.log(`App running on http://localhost:${this.PORT}`)
    })
  }
}

export default App
