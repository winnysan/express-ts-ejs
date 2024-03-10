import express from 'express'
import { dashboardPage } from '../controllers/pageController'
import { protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/', protect, dashboardPage)

export default router
