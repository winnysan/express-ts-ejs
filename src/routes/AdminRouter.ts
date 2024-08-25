import express from 'express'
import PageController from '../controllers/PageController'
import AuthMiddleware from '../middleware/AuthMiddleware'

class AdminRouter {
  public router: express.Router

  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  private setRoutes(): void {
    this.router.get('/', AuthMiddleware.protect, AuthMiddleware.admin, PageController.adminPage)
  }
}

export default new AdminRouter().router
