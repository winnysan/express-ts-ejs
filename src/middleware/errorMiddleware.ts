import express from 'express'
import Logger from '../lib/Logger'
import Message from '../lib/Message'
import { NodeEnv } from '../types/enums'

class ErrorMiddleware {
  /**
   * Not found handler
   */
  public notFound(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    const error = new Error(
      `${req.originalUrl} ${global.dictionary.messages.notFound}`
    )
    next(error)
  }

  /**
   * Error handler
   */
  public errorHandler(
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
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
