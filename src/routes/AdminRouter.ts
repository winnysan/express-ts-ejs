import express from 'express'
import AdminController from '../controllers/AdminController'
import AuthMiddleware from '../middleware/AuthMiddleware'

/**
 * Router for handling admin-related routes.
 */
class AdminRouter {
  /**
   * The Express router instance used for handling admin routes.
   * @public
   */
  public router: express.Router

  /**
   * Initializes a new instance of the AdminRouter class and sets up the routes.
   * @description Initializes the router and defines the routes for the admin section.
   */
  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  /**
   * Defines and sets the routes for the admin section.
   * @private
   * @description Sets up the route for the admin dashboard page. The route is protected by authentication and admin middleware.
   */
  private setRoutes(): void {
    this.router.get('/', AuthMiddleware.protect, AuthMiddleware.admin, AdminController.adminPage)
    this.router.get('/categories', AuthMiddleware.protect, AuthMiddleware.admin, AdminController.categoriesPage)
  }
}

export default new AdminRouter().router
