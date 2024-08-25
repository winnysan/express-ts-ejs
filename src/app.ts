import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import dotenv from 'dotenv'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import flash from 'express-flash'
import session from 'express-session'
import path from 'path'
import Database from './lib/Database'
import AuthMiddleware from './middleware/AuthMiddleware'
import ErrorMiddleware from './middleware/ErrorMiddleware'
import LocalizationMiddleware from './middleware/LocalizationMiddleware'
import AdminRouter from './routes/AdminRouter'
import DashboardRouter from './routes/DashboardRouter'
import PublicRouter from './routes/PublicRouter'

dotenv.config()

/**
 * Main application class for setting up and running the Express server.
 * @class
 */
class App {
  /**
   * The Express application instance.
   * @public
   * @type {express.Application}
   */
  public app: express.Application

  /**
   * The Database instance used for connecting to MongoDB.
   * @private
   * @type {Database}
   */
  private db: Database

  /**
   * The port number on which the server will listen.
   * @private
   * @type {number | undefined}
   */
  private PORT: number | undefined

  /**
   * Initializes a new instance of the App class, setting up the database connection,
   * middlewares, view engine, routes, and error handlers.
   */
  constructor() {
    this.app = express()
    this.db = new Database(process.env.MONGO_URI)
    this.PORT = process.env.PORT

    this.connectDatabase()
    this.setMiddlewares()
    this.setViewEngine()
    this.setRoutes()
    this.setErrorHandlers()
  }

  /**
   * Connects to the MongoDB database.
   * @private
   * @returns {Promise<void>} A promise that resolves when the database connection is established.
   */
  private async connectDatabase(): Promise<void> {
    await this.db.connect()
  }

  /**
   * Configures the middleware for the application, including body parsing, cookie parsing,
   * session management, flash messages, and static file serving.
   * @private
   * @returns {void}
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

    // Flash messages middleware
    this.app.use(flash())

    // Localization middleware
    this.app.use(LocalizationMiddleware.use)

    // Static files middleware
    this.app.use(express.static(path.join(__dirname, './public')))
  }

  /**
   * Sets up the view engine for the application to use EJS with Express Layouts.
   * @private
   * @returns {void}
   */
  private setViewEngine(): void {
    this.app.use(expressLayouts)
    this.app.set('layout', 'layouts/main')
    this.app.set('view engine', 'ejs')
    this.app.set('views', path.join(__dirname, 'views'))
  }

  /**
   * Configures the routes for the application, including public, dashboard, and admin routes.
   * @private
   * @returns {void}
   */
  private setRoutes(): void {
    this.app.use('/', AuthMiddleware.authCheck, PublicRouter)
    this.app.use('/dashboard', AuthMiddleware.authCheck, DashboardRouter)
    this.app.use('/admin', AuthMiddleware.authCheck, AdminRouter)
  }

  /**
   * Sets up error handling middleware for handling 404 errors and other server errors.
   * @private
   * @returns {void}
   */
  private setErrorHandlers(): void {
    this.app.use(ErrorMiddleware.notFound)
    this.app.use(ErrorMiddleware.errorHandler)
  }

  /**
   * Starts the Express server and listens for incoming connections.
   * @public
   * @returns {void}
   */
  public start(): void {
    this.app.listen(this.PORT, () => {
      console.log(`App running on http://localhost:${this.PORT}`)
    })
  }
}

export default App
