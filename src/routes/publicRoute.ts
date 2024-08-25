import express from 'express'
import AuthController from '../controllers/AuthController'
import PageController from '../controllers/PageController'
import PostController from '../controllers/PostController'
import AuthMiddleware from '../middleware/AuthMiddleware'
import RegisterValidationMiddleware from '../middleware/validation/RegisterValidationMiddleware'
import RegisterValidator from '../middleware/validation/RegisterValidator'

const router = express.Router()

router.get('/', PostController.getPosts)

router.post('/search', PostController.searchInPosts)

router.get('/post/:slug', PostController.getPostBySlug)

router.get('/register', AuthMiddleware.onlyPublic, PageController.registerPage)
router.post(
  '/register',
  AuthMiddleware.onlyPublic,
  RegisterValidator.getRegisterSchema(),
  RegisterValidationMiddleware.validate,
  AuthController.registerUser
)
router.get('/login', AuthMiddleware.onlyPublic, PageController.loginPage)
router.post('/login', AuthMiddleware.onlyPublic, AuthController.authUser)
router.post('/logout', AuthController.logoutUser)

export default router
