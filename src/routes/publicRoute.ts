import express from 'express'
import {
  authUser,
  logoutUser,
  registerUser,
} from '../controllers/authController'
import { loginPage, registerPage } from '../controllers/pageController'
import { getPosts, searchInPosts } from '../controllers/postController'
import { onlyPublic } from '../middleware/authMiddleware'
import {
  registerSchema,
  validateRegisterSchema,
} from '../middleware/validation/registerUserValidation'

const router = express.Router()

router.get('/', getPosts)

router.post('/search', searchInPosts)

router.get('/register', onlyPublic, registerPage)
router.post(
  '/register',
  onlyPublic,
  registerSchema,
  validateRegisterSchema,
  registerUser
)
router.get('/login', onlyPublic, loginPage)
router.post('/login', onlyPublic, authUser)
router.post('/logout', logoutUser)

export default router
