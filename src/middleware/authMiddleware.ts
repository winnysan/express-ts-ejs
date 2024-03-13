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
 * Auth check
 */
const authCheck = asyncHandler(
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
        throw new Error(`${global.dictionary.messages.unauthorized}, ${err}`)
      }
    } else {
      next()
    }
  }
)

/**
 * Protect route
 */
const protect = asyncHandler(
  async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const user: IUser | undefined = req.session.user

    if (!user) {
      res.redirect('/')
    } else {
      next()
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
    res.redirect('/')
  }
}

/**
 * Only public
 */
const onlyPublic = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  if (req.cookies.authToken || req.session.user) {
    res.redirect('/')
  } else {
    next()
  }
}

export { admin, authCheck, onlyPublic, protect }
