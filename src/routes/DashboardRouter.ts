import express from 'express'
import DashboardController from '../controllers/DashboardController'
import AuthMiddleware from '../middleware/AuthMiddleware'

/**
 * Router for handling dashboard-related routes.
 */
class DashboardRouter {
  /**
   * The Express router instance used for handling dashboard routes.
   * @public
   */
  public router: express.Router

  /**
   * Initializes a new instance of the DashboardRouter class and sets up the routes.
   * @description Initializes the router and defines routes for the dashboard section.
   */
  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  /**
   * Defines and sets the dashboard routes.
   * @private
   * @description Sets up the route for the dashboard page, protected by authentication middleware.
   */
  private setRoutes(): void {
    this.router.get('/', AuthMiddleware.protect, DashboardController.getPostsByUserID)
  }
}

export default new DashboardRouter().router
