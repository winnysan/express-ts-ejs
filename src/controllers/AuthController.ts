import bcrypt from 'bcryptjs'
import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import SessionManager from '../lib/SessionManager'
import User from '../models/User'
import { Role } from '../types/enums'

/**
 * Controller for authentication-related routes and actions.
 */
class AuthController {
  /**
   * Renders the registration page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'register' view with user data and page title.
   * @description Renders the registration page with user session and page title.
   */
  public registerPage(req: express.Request, res: express.Response): void {
    res.render('register', {
      user: req.session.user,
      title: global.dictionary.title.registerPage,
    })
  }

  /**
   * Renders the login page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'login' view with user data and page title.
   * @description Renders the login page with user session and page title.
   */
  public loginPage(req: express.Request, res: express.Response): void {
    res.render('login', {
      user: req.session.user,
      title: global.dictionary.title.loginPage,
    })
  }

  /**
   * Registers a new user.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Redirects to the home page or throws an error.
   * @throws Will throw an error if user registration fails.
   * @description Creates a new user with the provided data, assigns admin role if applicable, and sets auth token.
   */
  public registerUser = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
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

    res.json({
      message: global.dictionary.messages.youAreRegisteredAndLoggedIn,
      redirect: '/',
    })
  })

  /**
   * Authenticates a user.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Redirects to the home page or renders the login page with an error message.
   * @throws Will throw an error if authentication fails.
   * @description Verifies user credentials, sets auth token on success, otherwise returns an error message.
   */
  public authUser = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    const { email, password } = req.body

    const user = await User.findOne({ email })

    if (user && (await bcrypt.compare(password, user.password!))) {
      user.password = ''
      SessionManager.generateAuthToken(res, user._id.toString())

      res.json({
        message: global.dictionary.messages.youAreLoggedIn,
        redirect: '/',
      })
    } else {
      res.status(401).json({
        errors: [{ message: global.dictionary.messages.invalidCredentials }],
      })
    }
  })

  /**
   * Logs out a user by destroying the session and clearing the auth token.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Redirects to the home page.
   * @description Clears the auth token and session, then redirects to the home page.
   */
  public logoutUser = (req: express.Request, res: express.Response) => {
    SessionManager.destroyUserSession(req, res)
  }
}

export default new AuthController()
