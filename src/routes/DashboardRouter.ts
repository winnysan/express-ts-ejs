import express from 'express'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import PostValidationMiddleware from '../middleware/validation/PostValidationMiddleware'
import PostValidator from '../middleware/validation/PostValidator'

class DashboardRouter {
  public router: express.Router

  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  private setRoutes(): void {
    this.router.get('/', AuthMiddleware.protect, PostController.getPostsByUserID)
    this.router.get('/new-post', AuthMiddleware.protect, PostController.newPostPage)
    this.router.post(
      '/new-post',
      AuthMiddleware.protect,
      PostValidator.getPostSchema(),
      PostValidationMiddleware.validate,
      PostController.newPost
    )
  }
}

export default new DashboardRouter().router
