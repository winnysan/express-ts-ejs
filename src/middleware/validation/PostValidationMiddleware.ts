import express from 'express'
import { validationResult } from 'express-validator'

/**
 * Middleware for validating post data in a request.
 * This middleware checks for validation errors in the request and handles
 * rendering the new post page with error messages if validation fails.
 */
class PostValidationMiddleware {
  /**
   * Middleware function to validate post data.
   * @param req - The Express request object containing the post data.
   * @param res - The Express response object used to render the new post page with errors.
   * @param next - The next middleware function in the stack to call if validation passes.
   * @returns {void}
   * @description This method uses `express-validator` to check for validation errors
   * in the request. If errors are found, it renders the 'dashboard/new-post' page with
   * the error messages and any filled-in data. If there are no errors, it calls the next
   * middleware in the stack.
   */
  public validate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('dashboard/new-post', {
        alert: errors.array(),
        fill: { postTitle: req.body.title, postBody: req.body.body },
        title: global.dictionary.title.newPostPage,
      })
    } else {
      next()
    }
  }
}

export default new PostValidationMiddleware()
