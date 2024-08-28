import express from 'express'
import jwt from 'jsonwebtoken'
import AsyncHandler from '../lib/AsyncHandler'
import User, { IUser } from '../models/User'
import { Role } from '../types/enums'

type Decoded = {
  userId: string
  iat: number
  exp: number
}

/**
 * Middleware class for handling authentication and authorization in Express.js.
 */
class AuthMiddleware {
  /**
   * Middleware to check if the user is authenticated by verifying the JWT token.
   * If a valid token is found, it sets the user in the session.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @throws {Error} Throws an error if token verification fails.
   * @description This middleware checks for the `authToken` cookie and verifies it. If valid, it retrieves
   * the user from the database and attaches it to the session. If the token is invalid or missing, it simply
   * passes control to the next middleware.
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
   * Middleware to protect routes by ensuring the user is authenticated.
   * Redirects to the home page if the user is not authenticated.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @description This middleware checks if there is a user in the session. If not, it redirects to the home page.
   * If a user is present, it allows the request to proceed.
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
   * Middleware to allow access only to admin users.
   * Redirects to the home page if the user is not an admin.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @description This middleware checks if the authenticated user has the admin role. If not, it redirects to
   * the home page. If the user is an admin, it allows the request to proceed.
   */
  public admin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.session.user && req.session.user.role === Role.ADMIN) {
      next()
    } else {
      res.redirect('/')
    }
  }

  /**
   * Middleware to allow access only to unauthenticated users.
   * Redirects to the home page if the user is already authenticated or has a token.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @description This middleware checks if there is an `authToken` cookie or if a user is present in the session.
   * If either is true, it redirects to the home page. Otherwise, it allows the request to proceed.
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
