import express from 'express'

class ApiRouter {
  public router: express.Router

  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  private setRoutes(): void {
    this.router.post('/hello', (req: express.Request, res: express.Response): void => {
      const { data } = req.body
      console.log('data:', data)

      if (typeof data === 'string') {
        res.status(200).json({ message: 'Data has been received', data })
      } else {
        res.status(400).json({ message: 'Invalid format, must be a string' })
      }
    })
  }
}

export default new ApiRouter().router
