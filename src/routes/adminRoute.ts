import express from 'express'
import { adminPage } from '../controllers/pageController'
import { admin, protect } from '../middleware/authMiddleware'

const router = express.Router()

router.get('/', protect, admin, adminPage)

export default router
