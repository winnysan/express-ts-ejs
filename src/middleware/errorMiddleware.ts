import express from 'express'
import getErrorMessage from '../lib/getErrorMessage'
import logToFile from '../lib/logToFile'
import { NodeEnv } from '../types/enums'

/**
 * Not found handler
 */
const notFound = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const error = new Error(`${req.originalUrl} not found`)
  next(error)
}

/**
 * Error handler
 */
const errorHandler = (
  err: Error,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const message = getErrorMessage(err)

  const error = {
    message,
    name: err.name,
    stack: process.env.NODE_ENV === NodeEnv.PROD ? undefined : err.stack,
  }

  logToFile(error)
  res.render('error', { error })
}

export { errorHandler, notFound }
