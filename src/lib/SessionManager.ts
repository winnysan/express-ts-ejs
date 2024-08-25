import express from 'express'
import jwt from 'jsonwebtoken'
import { NodeEnv } from '../types/enums'

/**
 * Manages user sessions, including creating and destroying sessions.
 */
class SessionManager {
  /**
   * Generate authentication token and set it as a cookie.
   * @param res - The response object to set the cookie.
   * @param userId - The ID of the user to generate the token for.
   */
  public static generateAuthToken(res: express.Response, userId: string): void {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
      expiresIn: '30d',
    })

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV !== NodeEnv.DEV,
      sameSite: 'strict',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    })
  }

  /**
   * Destroy user session by clearing the auth token and user data.
   * @param req - The request object from which to clear the session.
   * @param res - The response object to set the cookie.
   */
  public static destroyUserSession(req: express.Request, res: express.Response): void {
    res.cookie('authToken', '', {
      httpOnly: true,
      expires: new Date(0),
    })

    delete req.session.user

    req.flash('info', global.dictionary.messages.youAreLoggedOut)
    res.redirect('/')
  }
}

export default SessionManager
