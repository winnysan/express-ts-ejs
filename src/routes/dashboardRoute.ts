import express from 'express'
import { getPostsByUserID, newPost, newPostPage } from '../controllers/postController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import { postSchema, validatePostSchema } from '../middleware/validation/newPostValidation'

const router = express.Router()

router.get('/', AuthMiddleware.protect, getPostsByUserID)
router.get('/new-post', AuthMiddleware.protect, newPostPage)
router.post('/new-post', AuthMiddleware.protect, postSchema, validatePostSchema, newPost)

export default router
