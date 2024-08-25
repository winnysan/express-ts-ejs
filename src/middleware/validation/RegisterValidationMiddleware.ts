import express from 'express'
import { validationResult } from 'express-validator'

/**
 * Middleware class for validating registration form data.
 */
class RegisterValidationMiddleware {
  /**
   * Middleware function to validate registration data and handle errors.
   * @param {express.Request} req - The HTTP request object.
   * @param {express.Response} res - The HTTP response object.
   * @param {express.NextFunction} next - The next middleware function in the stack.
   * @returns {void}
   * @description This function checks for validation errors in the request using `express-validator`.
   * If there are errors, it renders the registration page with error messages and the user's input.
   * If there are no errors, it calls the `next()` middleware function.
   */
  public validate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('register', {
        alert: errors.array(),
        fill: { email: req.body.email, name: req.body.name },
        title: global.dictionary.title.registerPage,
      })
    } else {
      next()
    }
  }
}

export default new RegisterValidationMiddleware()
