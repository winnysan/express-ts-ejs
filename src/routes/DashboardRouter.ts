import express from 'express'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import upload from '../middleware/uploadMiddleware'
import PostValidationMiddleware from '../middleware/validation/PostValidationMiddleware'
import PostValidator from '../middleware/validation/PostValidator'

/**
 * Router for handling dashboard-related routes.
 * @class
 */
class DashboardRouter {
  /**
   * The Express router instance used for handling dashboard routes.
   * @public
   * @type {express.Router}
   */
  public router: express.Router

  /**
   * Initializes a new instance of the DashboardRouter class and sets up the routes.
   */
  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  /**
   * Defines and sets the routes for the dashboard section.
   * @private
   * @returns {void}
   * @description Sets up routes for the dashboard:
   * - `GET /` to fetch posts by the authenticated user.
   * - `GET /new-post` to render the new post creation page for authenticated users.
   * - `POST /new-post` to handle form submission for creating a new post, including validation.
   */
  private setRoutes(): void {
    this.router.get('/', AuthMiddleware.protect, PostController.getPostsByUserID)
    this.router.get('/new-post', AuthMiddleware.protect, PostController.newPostPage)
    this.router.post(
      '/new-post',
      AuthMiddleware.protect,
      upload.array('images'),
      PostValidator.getPostSchema(),
      PostValidationMiddleware.validate,
      PostController.newPost
    )
  }
}

export default new DashboardRouter().router
