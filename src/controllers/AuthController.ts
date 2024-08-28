import bcrypt from 'bcryptjs'
import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import Message from '../lib/Message'
import SessionManager from '../lib/SessionManager'
import User from '../models/User'
import { Role } from '../types/enums'

/**
 * Controller for authentication-related routes and actions.
 */
class AuthController {
  /**
   * Registers a new user.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Redirects to the home page or throws an error.
   * @throws Will throw an error if user registration fails.
   * @description This method creates a new user with the provided email, name, and password.
   * If the email matches the admin email from the environment variables, the user is assigned the admin role.
   * The user's password is hashed before saving. An authentication token is generated and set in the response cookie.
   */
  public registerUser = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const { email, name, password } = req.body
      const isAdmin: boolean = process.env.ADMIN_USER === email

      const user = await User.create({
        email,
        name,
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        role: isAdmin ? Role.ADMIN : undefined,
      })
      user.password = ''
      SessionManager.generateAuthToken(res, user._id.toString())

      req.flash('info', global.dictionary.messages.youAreRegisteredAndLoggedIn)
      res.redirect('/')
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Authenticates a user.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Redirects to the home page or renders the login page with an error message.
   * @throws Will throw an error if authentication fails.
   * @description This method checks if a user with the provided email exists and if the provided password matches.
   * If authentication is successful, an authentication token is generated and set in the response cookie.
   * If authentication fails, the user is redirected to the login page with an error message.
   */
  public authUser = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })

      if (user && (await bcrypt.compare(password, user.password!))) {
        user.password = ''
        SessionManager.generateAuthToken(res, user._id.toString())

        req.flash('info', global.dictionary.messages.youAreLoggedIn)
        res.redirect('/')
      } else {
        res.render('login', {
          alert: [{ msg: global.dictionary.messages.invalidCredentials }],
          fill: { email: req.body.email },
          title: global.dictionary.title.loginPage,
        })
      }
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Logs out a user by destroying the session and clearing the auth token.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Redirects to the home page.
   * @description This method clears the authentication token cookie and deletes the user session.
   * The user is then redirected to the home page with a logout confirmation message.
   */
  public logoutUser = (req: express.Request, res: express.Response) => {
    SessionManager.destroyUserSession(req, res)
  }
}

export default new AuthController()
