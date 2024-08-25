import express from 'express'
import jwt from 'jsonwebtoken'
import AsyncHandler from '../lib/AsyncHandler'
import User, { IUser } from '../models/userModel'
import { Role } from '../types/enums'

type Decoded = {
  userId: string
  iat: number
  exp: number
}

class AuthMiddleware {
  /**
   * Auth check
   */
  public authCheck = AsyncHandler.wrap(
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const token: string | undefined = req.cookies.authToken

      if (token) {
        try {
          const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Decoded
          req.session.user = (await User.findById(decoded.userId).select('-password')) as IUser

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
  public protect = AsyncHandler.wrap(
    async (req: express.Request, res: express.Response, next: express.NextFunction) => {
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
  public admin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session.user && req.session.user.role === Role.ADMIN) {
      next()
    } else {
      res.redirect('/')
    }
  }

  /**
   * Only public
   */
  public onlyPublic = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies.authToken || req.session.user) {
      res.redirect('/')
    } else {
      next()
    }
  }
}

export default new AuthMiddleware()
