import express from 'express'
import { validationResult } from 'express-validator'

/**
 * Middleware class for validating form data.
 */
class LoginValidationMiddleware {
  /**
   * Middleware function to validate data and handle errors.
   * @param {express.Request} req - The HTTP request object.
   * @param {express.Response} res - The HTTP response object.
   * @param {express.NextFunction} next - The next middleware function in the stack.
   * @returns {void}
   * @description This function checks for validation errors in the request using `express-validator`.
   */
  public validate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.json({ errors: errors.array() })
    } else {
      next()
    }
  }
}

export default new LoginValidationMiddleware()
