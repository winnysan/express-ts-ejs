import bcrypt from 'bcryptjs'
import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import Icon from '../lib/Icon'
import RenderElement, { ElementData } from '../lib/RenderElement'
import SessionManager from '../lib/SessionManager'
import User from '../models/User'
import { Role } from '../types/enums'

/**
 * Controller for handling authentication-related routes and actions.
 */
class AuthController {
  /**
   * Renders the registration page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'register' view with user data and page title.
   * @description Renders the registration page with user session and page title. Uses main layout unless the request is AJAX.
   */
  public registerPage(req: express.Request, res: express.Response): void {
    const form: ElementData = {
      element: 'form',
      attr: {
        id: 'form',
        action: '/auth/register',
        method: 'POST',
        class: 'auth-form',
      },
      children: [
        {
          element: 'input',
          attr: {
            type: 'hidden',
            name: '_csrf',
            value: req.csrfToken?.() || '',
          },
        },
        // Email group
        {
          element: 'div',
          attr: {
            class: 'auth-form__group',
          },
          children: [
            {
              element: 'label',
              attr: {
                for: 'email',
                class: 'auth-form__label',
              },
              content: new Icon('mail').toSVG(),
            },
            {
              element: 'input',
              attr: {
                type: 'email',
                name: 'email',
                class: 'auth-form__input',
                placeholder: global.dictionary.form.email,
              },
            },
          ],
        },
        // Name group
        {
          element: 'div',
          attr: {
            class: 'auth-form__group',
          },
          children: [
            {
              element: 'label',
              attr: {
                for: 'name',
                class: 'auth-form__label',
              },
              content: new Icon('user').toSVG(),
            },
            {
              element: 'input',
              attr: {
                type: 'text',
                name: 'name',
                class: 'auth-form__input',
                placeholder: global.dictionary.form.name,
              },
            },
          ],
        },
        // Password group
        {
          element: 'div',
          attr: {
            class: 'auth-form__group',
          },
          children: [
            {
              element: 'label',
              attr: {
                for: 'password',
                class: 'auth-form__label',
              },
              content: new Icon('key').toSVG(),
            },
            {
              element: 'input',
              attr: {
                type: 'password',
                name: 'password',
                class: 'auth-form__input',
                placeholder: global.dictionary.form.password,
              },
            },
          ],
        },
        // Confirm password group
        {
          element: 'div',
          attr: {
            class: 'auth-form__group',
          },
          children: [
            {
              element: 'label',
              attr: {
                for: 'confirmPassword',
                class: 'auth-form__label',
              },
              content: new Icon('key').toSVG(),
            },
            {
              element: 'input',
              attr: {
                type: 'password',
                name: 'confirmPassword',
                class: 'auth-form__input',
                placeholder: global.dictionary.form.confirmPassword,
              },
            },
          ],
        },
        // Submit button
        {
          element: 'button',
          attr: {
            type: 'submit',
            class: 'auth-form__button',
          },
          content: global.dictionary.form.register,
        },
        // Login redirect
        {
          element: 'p',
          attr: {
            class: 'auth-form__redirect',
          },
          content: 'Máte už účet? <a href="/auth/login" class="link" data-link>Prihláste sa.</a>',
        },
      ],
    }

    res.render('register', {
      user: req.session.user,
      title: global.dictionary.title.registerPage,
      layout: res.locals.isAjax ? false : 'layouts/main',
      form: new RenderElement(form),
    })
  }

  /**
   * Renders the login page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'login' view with user data and page title.
   * @description Renders the login page with user session and page title. Uses main layout unless the request is AJAX.
   */
  public loginPage(req: express.Request, res: express.Response): void {
    const form: ElementData = {
      element: 'form',
      attr: {
        id: 'form',
        action: '/auth/login',
        method: 'POST',
        class: 'auth-form',
      },
      children: [
        {
          element: 'input',
          attr: {
            type: 'hidden',
            name: '_csrf',
            value: req.csrfToken?.() || '',
          },
        },
        // Email group
        {
          element: 'div',
          attr: {
            class: 'auth-form__group',
          },
          children: [
            {
              element: 'label',
              attr: {
                for: 'email',
                class: 'auth-form__label',
              },
              content: new Icon('mail').toSVG(),
            },
            {
              element: 'input',
              attr: {
                type: 'email',
                name: 'email',
                class: 'auth-form__input',
                placeholder: global.dictionary.form.email,
              },
            },
          ],
        },
        // Password group
        {
          element: 'div',
          attr: {
            class: 'auth-form__group',
          },
          children: [
            {
              element: 'label',
              attr: {
                for: 'password',
                class: 'auth-form__label',
              },
              content: new Icon('key').toSVG(),
            },
            {
              element: 'input',
              attr: {
                type: 'password',
                name: 'password',
                class: 'auth-form__input',
                placeholder: global.dictionary.form.password,
              },
            },
          ],
        },
        // Submit button
        {
          element: 'button',
          attr: {
            type: 'submit',
            class: 'auth-form__button',
          },
          content: global.dictionary.form.login,
        },
        // Register redirect
        {
          element: 'p',
          attr: {
            class: 'auth-form__redirect',
          },
          content: 'Ešte nemáte účet? <a href="/auth/register" class="link" data-link>Zaregistrujte sa.</a>',
        },
      ],
    }

    res.render('login', {
      user: req.session.user,
      title: global.dictionary.title.loginPage,
      layout: res.locals.isAjax ? false : 'layouts/main',
      form: new RenderElement(form),
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
   * @description Clears the authentication token and session, then redirects to the home page.
   */
  public logoutUser = (req: express.Request, res: express.Response) => {
    SessionManager.destroyUserSession(req, res)
  }
}

export default new AuthController()
