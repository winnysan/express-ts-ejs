import express from 'express'
import jwt from 'jsonwebtoken'
import getErrorMessage from '../lib/getErrorMessage'
import logToFile from '../lib/logToFile'
import User, { IUser } from '../models/userModel'
import { Role } from '../types/enums'
import asyncHandler from './asyncHandler'

type Decoded = {
  userId: string
  iat: number
  exp: number
}

/**
 * Protect route
 */
const protect = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const token: string | undefined = req.cookies.authToken

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Decoded
        req.user = (await User.findById(decoded.userId).select(
          '-password'
        )) as IUser

        next()
      } catch (err: unknown) {
        logToFile(`Unauthorized, ${err}`)
        throw new Error(`Unauthorized, ${err}`)
      }
    } else {
      logToFile('Unauthorized, user')
      throw new Error('Unauthorized, user')
    }
  }
)

/**
 * Admin protect
 */
const admin = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.user && req.user.role === Role.ADMIN) {
    next()
  } else {
    logToFile('Unauthorized, admin')
    throw new Error('Unauthorized, admin')
  }
}

export { admin, protect }
