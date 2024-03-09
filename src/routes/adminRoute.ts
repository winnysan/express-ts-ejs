import express from 'express'
import { auth, register } from '../controllers/authController'
import { adminPage, dashboardPage } from '../controllers/pageController'
import { admin, protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/', adminPage)
router.get('/dashboard', protect, admin, dashboardPage)
router.post('/register', register)
router.post('/auth', auth)

export default router
