import express from 'express'
import jwt from 'jsonwebtoken'
import { NodeEnv } from '../types/enums'

/**
 * Manages user sessions, including generating and destroying authentication tokens.
 */
class SessionManager {
  /**
   * Generates an authentication token and sets it as a cookie in the response.
   * @param res - The Express response object used to set the cookie.
   * @param userId - The ID of the user for whom the token is being generated.
   * @returns {void}
   * @description This method creates a JSON Web Token (JWT) containing the user's ID and sets it in a cookie named `authToken`.
   * The cookie is configured to be HTTP-only, secure based on the environment, and has a maximum age of 30 days.
   *
   * @throws {Error} Throws an error if JWT signing fails due to issues with the `JWT_SECRET` environment variable.
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
   * Destroys the user's session by clearing the authentication cookie and removing the user from the session.
   * @param req - The Express request object containing the user session.
   * @param res - The Express response object used to clear the cookie and redirect the user.
   * @returns {void}
   * @description This method clears the `authToken` cookie by setting its expiration date to the past and deletes the user from the session.
   * It also sets a flash message indicating the user has been logged out and redirects the user to the homepage.
   *
   * @throws {Error} Throws an error if there is an issue with session management or flash messaging.
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
