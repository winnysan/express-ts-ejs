import express from 'express'
import { authUser } from '../controllers/authController'
import { adminPage, dashboardPage } from '../controllers/pageController'
import { admin, protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/', adminPage)
router.get('/dashboard', protect, admin, dashboardPage)
router.post('/auth', authUser)

export default router
