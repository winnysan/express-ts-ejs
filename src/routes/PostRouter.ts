import express from 'express'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import upload from '../middleware/UploadMiddleware'
import ValidationMiddleware from '../middleware/ValidationMiddleware'

/**
 * Router for handling post-related routes.
 */
class PostRouter {
  /**
   * The Express router instance used for handling post routes.
   * @public
   */
  public router: express.Router

  /**
   * Initializes a new instance of the PostRouter class and sets up the routes.
   * @description Initializes the router and defines routes for handling posts.
   */
  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  /**
   * Defines and sets the post-related routes.
   * @private
   * @description Sets up routes for viewing, creating, editing, and searching posts.
   */
  private setRoutes(): void {
    /**
     * Home page
     */
    this.router.get('/', PostController.getPosts)

    /**
     * Search
     */
    this.router.post('/search', PostController.searchInPosts)

    /**
     * Post by slug
     */
    this.router.get('/post/:slug', PostController.getPostBySlug)

    /**
     * New post
     */
    this.router.get('/new-post', AuthMiddleware.protect, PostController.newPostPage)
    this.router.post(
      '/new-post',
      AuthMiddleware.protect,
      upload.array('images'),
      ValidationMiddleware.post,
      PostController.newPost
    )

    /**
     * Edit post
     */
    this.router.post(
      '/edit-post/:id',
      AuthMiddleware.protect,
      upload.array('images'),
      ValidationMiddleware.post,
      PostController.editPost
    )
  }
}

export default new PostRouter().router
