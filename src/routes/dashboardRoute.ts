import express from 'express'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import { postSchema, validatePostSchema } from '../middleware/validation/newPostValidation'

const router = express.Router()

router.get('/', AuthMiddleware.protect, PostController.getPostsByUserID)
router.get('/new-post', AuthMiddleware.protect, PostController.newPostPage)
router.post('/new-post', AuthMiddleware.protect, postSchema, validatePostSchema, PostController.newPost)

export default router
