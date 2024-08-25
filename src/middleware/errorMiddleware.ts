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
   * @description Creates a 404 Not Found error with the original request URL and passes it to the next middleware.
   */
  public notFound(req: express.Request, res: express.Response, next: express.NextFunction): void {
    const error = new Error(`${req.originalUrl} ${global.dictionary.messages.notFound}`)
    next(error)
  }

  /**
   * Middleware for handling errors that occur during request processing.
   * @param err - The error object.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @description Logs the error using the `Logger` and renders an error page. The error stack trace is included
   * only if the application is not in production mode.
   */
  public errorHandler(err: Error, req: express.Request, res: express.Response, next: express.NextFunction): void {
    const message = Message.getErrorMessage(err)

    const error = {
      message,
      name: err.name,
      stack: process.env.NODE_ENV === NodeEnv.PROD ? undefined : err.stack,
    }

    Logger.logToFile(error)
    res.render('error', { error, title: global.dictionary.title.errorPage })
  }
}

export default new ErrorMiddleware()
