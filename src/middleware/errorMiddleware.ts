import dotenv from 'dotenv'
import express from 'express'
import getErrorMessage from '../lib/getErrorMessage'
import { NodeEnv } from '../types/enums'

dotenv.config()

/**
 * Not found handler
 */
const notFound = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const error = new Error(`Not Found - ${req.originalUrl}`)
  res.status(404)
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
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode
  const message = getErrorMessage(err)

  res.status(statusCode).json({
    message,
    stack: process.env.NODE_ENV === NodeEnv.PROD ? null : err.stack,
  })
}

export { errorHandler, notFound }
