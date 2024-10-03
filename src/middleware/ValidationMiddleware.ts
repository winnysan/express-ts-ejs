import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import { Validation } from '../lib/Validator'
import User from '../models/User'

/**
 * Middleware class for handling input validation.
 */
class ValidationMiddleware {
  /**
   * Middleware function for validating registration data.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   * @description Validates registration fields: name, email, password, and confirmPassword. Ensures email uniqueness.
   */
  public static register = AsyncHandler.wrap(
    async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      const validation = new Validation(req)

      validation.field('name').required('Pole "name" je vyžadované.')

      validation
        .field('email')
        .required('Pole "email" je vyžadované.')
        .email('Neplatná e-mailová adresa.')
        .unique(User, 'email', 'Email musí byť unikátny.')

      validation.field('password').required('Pole "password" je vyžadované.').min(8, 'Heslo musí mať aspoň 8 znakov.')

      validation
        .field('confirmPassword')
        .required('Pole "confirmPassword" je vyžadované.')
        .confirm('password', 'Heslá sa nezhodujú.')

      await validation.runValidations()

      if (validation.errors.length > 0) {
        res.json({ errors: validation.errors })
      } else {
        next()
      }
    }
  )

  /**
   * Middleware function for validating login data.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   * @description Validates login fields: email and password.
   */
  public static login = AsyncHandler.wrap(
    async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      const validation = new Validation(req)

      validation.field('email').required('Pole "email" je vyžadované.').email('Neplatná e-mailová adresa.')

      validation.field('password').required('Pole "password" je vyžadované.')

      await validation.runValidations()

      if (validation.errors.length > 0) {
        res.json({ errors: validation.errors })
      } else {
        next()
      }
    }
  )

  /**
   * Middleware function for validating post data.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function.
   * @description Validates post fields: title, body, and images. Ensures valid file formats for images.
   */
  public static post = AsyncHandler.wrap(
    async (req: express.Request, res: express.Response, next: express.NextFunction): Promise<void> => {
      const validation = new Validation(req)

      validation.field('title').required('Pole "title" je vyžadované.')

      validation.field('body').required('Pole "body" je vyžadované.')

      validation.field('images').mimetype(['image/jpeg', 'image/png', 'image/gif'], 'Neplatný formát súboru.')

      await validation.runValidations()

      if (validation.errors.length > 0) {
        res.json({ errors: validation.errors })
      } else {
        next()
      }
    }
  )
}

export default ValidationMiddleware
