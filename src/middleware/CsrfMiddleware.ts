import express from 'express'
import lusca from 'lusca'

/**
 * Middleware class for handling CSRF protection using Lusca.
 *
 * @class CsrfMiddleware
 */
class CsrfMiddleware {
  /**
   * Initializes and returns an array of middleware functions for CSRF protection.
   *
   * The first middleware function applies CSRF protection using Lusca.
   * The second middleware function extracts the CSRF token and sets it in `res.locals`,
   * making it available to views and other middleware.
   *
   * @static
   * @returns {Array<express.RequestHandler>} An array of middleware functions.
   */
  public static init() {
    return [
      lusca.csrf(),
      (req: express.Request, res: express.Response, next: express.NextFunction) => {
        res.locals.csrfToken = req.csrfToken?.()
        next()
      },
    ]
  }
}

export default CsrfMiddleware
