import express from 'express'
import { NodeEnv } from '../types/enums'

/**
 * Middleware for setting the application environment.
 */
class AppEnvMiddleware {
  /**
   * Middleware function to set the application environment.
   *
   * @param {express.Request} req - The request object.
   * @param {express.Response} res - The response object.
   * @param {express.NextFunction} next - The next middleware function in the stack.
   */
  public use(req: express.Request, res: express.Response, next: express.NextFunction): void {
    if (process.env.NODE_ENV === NodeEnv.DEV) global.env = process.env.NODE_ENV

    next()
  }
}

export default new AppEnvMiddleware()
