import express from 'express'
import AuthController from '../controllers/AuthController'
import PageController from '../controllers/PageController'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import upload from '../middleware/uploadMiddleware'
import LoginValidationMiddleware from '../middleware/validation/LoginValidationMiddleware'
import LoginValidator from '../middleware/validation/LoginValidator'
import RegisterValidationMiddleware from '../middleware/validation/RegisterValidationMiddleware'
import RegisterValidator from '../middleware/validation/RegisterValidator'

/**
 * Router for handling public routes.
 * @class
 */
class PublicRouter {
  /**
   * The Express router instance used for handling public routes.
   * @public
   * @type {express.Router}
   */
  public router: express.Router

  /**
   * Initializes a new instance of the PublicRouter class and sets up the routes.
   */
  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  /**
   * Defines and sets the routes for public access.
   * @private
   * @returns {void}
   * @description Sets up routes for public access, including:
   * - `GET /` to fetch posts.
   * - `POST /search` to search posts.
   * - `GET /post/:slug` to fetch a single post by slug.
   * - `GET /register` to render the registration page, accessible only to non-authenticated users.
   * - `POST /register` to handle user registration, including validation.
   * - `GET /login` to render the login page, accessible only to non-authenticated users.
   * - `POST /login` to handle user authentication, including validation.
   * - `POST /logout` to handle user logout.
   */
  private setRoutes(): void {
    this.router.get('/', PostController.getPosts)

    this.router.post('/search', PostController.searchInPosts)

    this.router.get('/post/:slug', PostController.getPostBySlug)

    this.router.get('/register', AuthMiddleware.onlyPublic, PageController.registerPage)
    this.router.post(
      '/register',
      AuthMiddleware.onlyPublic,
      upload.none(),
      RegisterValidator.getRegisterSchema(),
      RegisterValidationMiddleware.validate,
      AuthController.registerUser
    )

    this.router.get('/login', AuthMiddleware.onlyPublic, PageController.loginPage)
    this.router.post(
      '/login',
      AuthMiddleware.onlyPublic,
      upload.none(),
      LoginValidator.getLoginSchema(),
      LoginValidationMiddleware.validate,
      AuthController.authUser
    )
    this.router.post('/logout', AuthController.logoutUser)
  }
}

export default new PublicRouter().router
