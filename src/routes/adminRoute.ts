import express from 'express'
import { adminPage } from '../controllers/pageController'
import AuthMiddleware from '../middleware/AuthMiddleware'

const router = express.Router()

router.get('/', AuthMiddleware.protect, AuthMiddleware.admin, adminPage)

export default router
