import express from 'express'
import { dashboardPage } from '../controllers/pageController'
import { newPost, newPostPage } from '../controllers/postController'
import { protect } from '../middleware/authMiddleware'
import {
  postSchema,
  validatePostSchema,
} from '../middleware/validation/newPostValidation'

const router = express.Router()

router.get('/', protect, dashboardPage)
router.get('/new-post', protect, newPostPage)
router.post('/new-post', protect, postSchema, validatePostSchema, newPost)

export default router
