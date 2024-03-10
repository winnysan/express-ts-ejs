import express from 'express'
import { registerUser } from '../controllers/authController'
import { homePage, registerPage } from '../controllers/pageController'
import {
  registerSchema,
  validateRegisterSchema,
} from '../middleware/validation/registerUserValidation'

const router = express.Router()

router.get('/', homePage)
router.get('/register', registerPage)
router.post('/register', registerSchema, validateRegisterSchema, registerUser)

export default router
