import express from 'express'
import jwt from 'jsonwebtoken'
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
        req.session.user = (await User.findById(decoded.userId).select(
          '-password'
        )) as IUser

        next()
      } catch (err: unknown) {
        req.session.user = undefined
        throw new Error(`Unauthorized, ${err}`)
      }
    } else {
      req.session.user = undefined
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
  if (req.session.user && req.session.user.role === Role.ADMIN) {
    next()
  } else {
    throw new Error('Unauthorized, admin')
  }
}

export { admin, protect }
