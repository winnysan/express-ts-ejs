import express from 'express'
import { authUser, registerUser } from '../controllers/authController'
import {
  homePage,
  loginPage,
  registerPage,
} from '../controllers/pageController'
import {
  registerSchema,
  validateRegisterSchema,
} from '../middleware/validation/registerUserValidation'

const router = express.Router()

router.get('/', homePage)
router.get('/register', registerPage)
router.post('/register', registerSchema, validateRegisterSchema, registerUser)
router.get('/login', loginPage)
router.post('/login', authUser)

export default router
