import express from 'express'
import PageController from '../controllers/PageController'
import AuthMiddleware from '../middleware/AuthMiddleware'

const router = express.Router()

router.get('/', AuthMiddleware.protect, AuthMiddleware.admin, PageController.adminPage)

export default router
