import express from 'express'
import { validationResult } from 'express-validator'
import fs from 'fs-extra'
import Message from '../../lib/Message'

/**
 * Middleware for validating post data in a request.
 * This middleware checks for validation errors in the request and handles
 * returning a JSON response with error messages if validation fails. If files
 * are uploaded as part of the request and validation fails, the uploaded files
 * are removed from the temporary storage to prevent unnecessary storage usage.
 */
class PostValidationMiddleware {
  /**
   * Middleware function to validate post data.
   *
   * @param {express.Request} req - The Express request object containing the post data and uploaded files.
   * @param {express.Response} res - The Express response object used to return a JSON response with errors.
   * @param {express.NextFunction} next - The next middleware function in the stack to call if validation passes.
   * @returns {void}
   *
   * @description This method uses `express-validator` to check for validation errors
   * in the request. If errors are found, it returns a JSON response with an array of errors.
   * Additionally, if any files were uploaded as part of the request, they are deleted from the
   * temporary storage to avoid leaving unused files on the server. If there are no validation
   * errors, the method proceeds to the next middleware in the stack.
   */
  public validate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      if (req.files) {
        const files = req.files as Express.Multer.File[]
        files.forEach(file => {
          fs.remove(file.path, err => {
            if (err) throw new Error(Message.getErrorMessage(err))
          })
        })
      }

      res.json({ errors: errors.array() })
    } else {
      next()
    }
  }
}

export default new PostValidationMiddleware()
