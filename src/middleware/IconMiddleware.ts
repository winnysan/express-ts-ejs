import express from 'express'
import Icon from '../lib/Icon'

/**
 * Middleware for adding the Icon class to the response locals.
 * @class
 */
class IconMiddleware {
  /**
   * Adds the Icon class to res.locals for use in views.
   * @param {express.Request} req - The HTTP request object.
   * @param {express.Response} res - The HTTP response object.
   * @param {express.NextFunction} next - The next middleware function in the stack.
   * @description Makes the Icon class available in response locals for use in templates.
   */
  public use(req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.locals.Icon = Icon
    next()
  }
}

export default new IconMiddleware()
