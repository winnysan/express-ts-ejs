import express from 'express'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import PostValidationMiddleware from '../middleware/validation/PostValidationMiddleware'
import PostValidator from '../middleware/validation/PostValidator'

const router = express.Router()

router.get('/', AuthMiddleware.protect, PostController.getPostsByUserID)
router.get('/new-post', AuthMiddleware.protect, PostController.newPostPage)
router.post(
  '/new-post',
  AuthMiddleware.protect,
  PostValidator.getPostSchema(),
  PostValidationMiddleware.validate,
  PostController.newPost
)

export default router
