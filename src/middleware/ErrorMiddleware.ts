import express from 'express'
import Logger from '../lib/Logger'
import Message from '../lib/Message'
import { NodeEnv } from '../types/enums'

/**
 * Middleware class for handling errors in an Express.js application.
 */
class ErrorMiddleware {
  /**
   * Middleware for handling 404 Not Found errors.
   * This middleware is called when no route matches the request.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @description Creates a 404 Not Found error with the request URL and passes it to the next middleware.
   */
  public notFound(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const error = new Error(`${req.originalUrl} ${global.dictionary.messages.notFound}`)

    res.status(404)

    next(error)
  }

  /**
   * Middleware for handling errors that occur during request processing.
   * @param err - The error object.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @description Logs the error and renders an error page. The stack trace is included only if not in production mode.
   */
  public errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
    const message = Message.getErrorMessage(err)

    const error = {
      message,
      name: err.name,
      code: res.statusCode !== 200 ? res.statusCode : 500,
      stack: err.stack,
    }

    Logger.logToFile(error)

    if (process.env.NODE_ENV === NodeEnv.PROD) {
      error.message = global.dictionary.messages.somethingWentWrong
      error.stack = undefined
    }

    if (res.statusCode === 404) {
      res.render('error', {
        title: global.dictionary.title.errorPage,
        error,
      })
    } else {
      res.status(res.statusCode !== 200 ? res.statusCode : 500).json({
        errors: [error],
      })
    }
  }
}

export default new ErrorMiddleware()
