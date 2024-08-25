import express from 'express'
import PageController from '../controllers/PageController'
import AuthMiddleware from '../middleware/AuthMiddleware'

/**
 * Router for handling admin-related routes.
 * @class
 */
class AdminRouter {
  /**
   * The Express router instance used for handling admin routes.
   * @public
   * @type {express.Router}
   */
  public router: express.Router

  /**
   * Initializes a new instance of the AdminRouter class and sets up the routes.
   */
  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  /**
   * Defines and sets the routes for the admin section.
   * @private
   * @returns {void}
   * @description Sets up the route for the admin dashboard page. The route is protected by authentication middleware and requires admin privileges.
   */
  private setRoutes(): void {
    this.router.get('/', AuthMiddleware.protect, AuthMiddleware.admin, PageController.adminPage)
  }
}

export default new AdminRouter().router
