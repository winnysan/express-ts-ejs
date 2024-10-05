import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import flash from 'express-flash'
import session from 'express-session'
import path from 'path'
import Database from './lib/Database'
import AjaxMiddleware from './middleware/AjaxMiddleware'
import AuthMiddleware from './middleware/AuthMiddleware'
import CsrfMiddleware from './middleware/CsrfMiddleware'
import ErrorMiddleware from './middleware/ErrorMiddleware'
import LocalizationMiddleware from './middleware/LocalizationMiddleware'
import AdminRouter from './routes/AdminRouter'
import ApiRouter from './routes/ApiRouter'
import AuthRouter from './routes/AuthRouter'
import DashboardRouter from './routes/DashboardRouter'
import PostRouter from './routes/PostRouter'

dotenv.config()

/**
 * Main application class for setting up and running the Express server.
 */
class App {
  /**
   * The Express application instance.
   * @public
   */
  public app: express.Application

  /**
   * The Database instance used for connecting to MongoDB.
   * @private
   */
  private db: Database

  /**
   * The port number on which the server will listen.
   * @private
   */
  private PORT: number | undefined

  /**
   * Initializes a new instance of the App class, setting up the database connection,
   * middlewares, view engine, routes, and error handlers.
   * @description Initializes the Express app, sets up middleware, routes, view engine, and database connection.
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
   * @description Establishes a connection to the MongoDB database using the Database class.
   */
  private async connectDatabase(): Promise<void> {
    await this.db.connect()
  }

  /**
   * Configures middleware for body parsing, cookie parsing, session management, CSRF protection, and static files.
   * @private
   * @description Sets up various middlewares like body parser, session, CSRF protection, and static file handling.
   */
  private setMiddlewares(): void {
    this.app.use(bodyParser.json())
    this.app.use(bodyParser.urlencoded({ extended: true }))
    this.app.use(cookieParser())

    this.app.use(
      cors({
        origin: process.env.CLIENT_ORIGIN,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
      })
    )

    this.app.use(
      session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
      })
    )

    this.app.use(CsrfMiddleware.init())
    this.app.use(AjaxMiddleware.isAjax)
    this.app.use(flash())
    this.app.use(LocalizationMiddleware.use)
    this.app.use(express.static(path.join(__dirname, './public')))
    this.app.use('/uploads', express.static(path.join(__dirname, '../uploads')))
  }

  /**
   * Sets up the view engine for the application to use EJS with Express Layouts.
   * @private
   * @description Configures the view engine to use EJS templates and layouts.
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
   * @description Defines the routes for the application, including authentication, dashboard, admin, and API routes.
   */
  private setRoutes(): void {
    this.app.use('/', AuthMiddleware.authCheck, PostRouter)
    this.app.use('/auth', AuthMiddleware.authCheck, AuthRouter)
    this.app.use('/dashboard', AuthMiddleware.authCheck, DashboardRouter)
    this.app.use('/admin', AuthMiddleware.authCheck, AdminRouter)
    this.app.use('/api', ApiRouter)
  }

  /**
   * Sets up error handling middleware for handling 404 errors and other server errors.
   * @private
   * @description Configures middleware for handling 404 Not Found and other server errors.
   */
  private setErrorHandlers(): void {
    this.app.use(ErrorMiddleware.notFound)
    this.app.use(ErrorMiddleware.errorHandler)
  }

  /**
   * Starts the Express server and listens for incoming connections.
   * @public
   * @description Starts the server and listens on the configured port.
   */
  public start(): void {
    this.app.listen(this.PORT, () => {
      console.log(`App running on http://localhost:${this.PORT}`)
    })
  }
}

export default App
