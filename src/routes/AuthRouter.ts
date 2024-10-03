import express from 'express'
import AuthController from '../controllers/AuthController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import upload from '../middleware/UploadMiddleware'
import ValidationMiddleware from '../middleware/ValidationMiddleware'

/**
 * Router for handling authentication-related routes.
 */
class AuthRouter {
  /**
   * The Express router instance used for handling routes.
   * @public
   */
  public router: express.Router

  /**
   * Initializes a new instance of the AuthRouter class and sets up the routes.
   * @description Initializes the router and defines routes for authentication processes like register, login, and logout.
   */
  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  /**
   * Defines and sets the authentication routes.
   * @private
   * @description Sets up routes for registration, login, and logout, with appropriate middlewares for validation and file upload handling.
   */
  private setRoutes(): void {
    /*
     * Register
     */
    this.router.get('/register', AuthMiddleware.onlyPublic, AuthController.registerPage)
    this.router.post(
      '/register',
      AuthMiddleware.onlyPublic,
      upload.none(),
      ValidationMiddleware.register,
      AuthController.registerUser
    )

    /*
     * Login
     */
    this.router.get('/login', AuthMiddleware.onlyPublic, AuthController.loginPage)
    this.router.post(
      '/login',
      AuthMiddleware.onlyPublic,
      upload.none(),
      ValidationMiddleware.login,
      AuthController.authUser
    )

    /*
     * Logout
     */
    this.router.post('/logout', AuthController.logoutUser)
  }
}

export default new AuthRouter().router
