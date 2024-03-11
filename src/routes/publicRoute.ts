import express from 'express'
import {
  authUser,
  logoutUser,
  registerUser,
} from '../controllers/authController'
import {
  homePage,
  loginPage,
  registerPage,
} from '../controllers/pageController'
import { onlyPublic } from '../middleware/authMiddleware'
import {
  registerSchema,
  validateRegisterSchema,
} from '../middleware/validation/registerUserValidation'

const router = express.Router()

router.get('/', homePage)
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
