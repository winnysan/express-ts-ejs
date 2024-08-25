import { body } from 'express-validator'
import User from '../../models/userModel'

/**
 * Validator class for handling registration data validation.
 */
class RegisterValidator {
  /**
   * Defines the validation schema for registration.
   * @returns {Array<import('express-validator').ValidationChain>} - An array of validation chains for registration fields.
   * @description This method returns an array of validation rules for registration form fields including:
   * - `name`: Required and trimmed.
   * - `email`: Required, must be a valid email, normalized, and unique.
   * - `password`: Required, trimmed, and must have at least 6 characters.
   * - `confirmPassword`: Required, must match the `password` field.
   *
   * Validation is performed using `express-validator` methods and custom checks:
   * - Checks if the email is already registered.
   * - Validates that the passwords match.
   */
  public static getRegisterSchema() {
    return [
      body('name')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.isRequired),
      body('email')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.emailIsRequired)
        .isEmail()
        .normalizeEmail()
        .withMessage(() => global.dictionary.validation.emailIsInvalid)
        .custom(async value => {
          const user = await User.findOne({ email: value })
          if (user) {
            throw new Error(global.dictionary.validation.emailAlreadyExists)
          }
          return true
        }),
      body('password')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.passwordIsRequired)
        .isLength({ min: 6 })
        .withMessage(() => global.dictionary.validation.passwordMustHaveAtLeast6Characters),
      body('confirmPassword')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.confirmPasswordIsRequired)
        .custom((value, { req }) => {
          if (value !== req.body.password) {
            throw new Error(global.dictionary.validation.passwordsMustMatch)
          }
          return true
        }),
    ]
  }
}

export default RegisterValidator
