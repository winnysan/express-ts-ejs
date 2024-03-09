import express from 'express'
import { auth, register } from '../controllers/authController'
import { adminPage } from '../controllers/pageController'

const router = express.Router()

router.get('/', adminPage)
router.post('/register', register)
router.post('/auth', auth)

export default router
