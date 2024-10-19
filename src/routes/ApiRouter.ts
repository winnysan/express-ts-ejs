import express from 'express'
import ApiCategoryController from '../controllers/api/ApiCategoryController'

class ApiRouter {
  public router: express.Router

  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  private setRoutes(): void {
    /**
     * CSRF token
     */
    this.router.get('/csrf-token', (req: express.Request, res: express.Response) => {
      const csrfToken = req.csrfToken?.()

      if (csrfToken) {
        res.json({ csrfToken })
      } else {
        res.status(500).json({ message: 'CSRF token not available' })
      }
    })

    /**
     * Hello
     */
    this.router.post('/hello', (req: express.Request, res: express.Response): void => {
      const { data } = req.body

      if (typeof data === 'string') {
        res.status(200).json({ message: 'Data has been received', data })
      } else {
        res.status(400).json({ message: 'Invalid format, must be a string' })
      }
    })

    /**
     * Categories
     */
    this.router.post('/categories', ApiCategoryController.categoriesPost)
  }
}

export default new ApiRouter().router
