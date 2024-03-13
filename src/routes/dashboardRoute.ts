import express from 'express'
import {
  getPostsByUserID,
  newPost,
  newPostPage,
} from '../controllers/postController'
import { protect } from '../middleware/authMiddleware'
import {
  postSchema,
  validatePostSchema,
} from '../middleware/validation/newPostValidation'

const router = express.Router()

router.get('/', protect, getPostsByUserID)
router.get('/new-post', protect, newPostPage)
router.post('/new-post', protect, postSchema, validatePostSchema, newPost)

export default router
