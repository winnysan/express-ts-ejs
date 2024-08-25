import express from 'express'
import AuthController from '../controllers/AuthController'
import PageController from '../controllers/PageController'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import RegisterValidationMiddleware from '../middleware/validation/RegisterValidationMiddleware'
import RegisterValidator from '../middleware/validation/RegisterValidator'

class PublicRouter {
  public router: express.Router

  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  private setRoutes(): void {
    this.router.get('/', PostController.getPosts)

    this.router.post('/search', PostController.searchInPosts)

    this.router.get('/post/:slug', PostController.getPostBySlug)

    this.router.get('/register', AuthMiddleware.onlyPublic, PageController.registerPage)
    this.router.post(
      '/register',
      AuthMiddleware.onlyPublic,
      RegisterValidator.getRegisterSchema(),
      RegisterValidationMiddleware.validate,
      AuthController.registerUser
    )

    this.router.get('/login', AuthMiddleware.onlyPublic, PageController.loginPage)
    this.router.post('/login', AuthMiddleware.onlyPublic, AuthController.authUser)
    this.router.post('/logout', AuthController.logoutUser)
  }
}

export default new PublicRouter().router
