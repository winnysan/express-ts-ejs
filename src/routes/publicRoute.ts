import express from 'express'
import AuthController from '../controllers/AuthController'
import { loginPage, registerPage } from '../controllers/pageController'
import { getPostBySlug, getPosts, searchInPosts } from '../controllers/postController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import { registerSchema, validateRegisterSchema } from '../middleware/validation/registerUserValidation'

const router = express.Router()

router.get('/', getPosts)

router.post('/search', searchInPosts)

router.get('/post/:slug', getPostBySlug)

router.get('/register', AuthMiddleware.onlyPublic, registerPage)
router.post('/register', AuthMiddleware.onlyPublic, registerSchema, validateRegisterSchema, AuthController.registerUser)
router.get('/login', AuthMiddleware.onlyPublic, loginPage)
router.post('/login', AuthMiddleware.onlyPublic, AuthController.authUser)
router.post('/logout', AuthController.logoutUser)

export default router
