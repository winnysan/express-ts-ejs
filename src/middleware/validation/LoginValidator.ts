import { body } from 'express-validator'

/**
 * Validator class for handling login data validation.
 */
class LoginValidator {
  /**
   * Defines the validation schema for login.
   * @returns {Array<import('express-validator').ValidationChain>} - An array of validation chains for login fields.
   */
  public static getLoginSchema() {
    return [
      body('email')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.emailIsRequired)
        .isEmail()
        .normalizeEmail()
        .withMessage(() => global.dictionary.validation.emailIsInvalid),
      body('password')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.passwordIsRequired),
    ]
  }
}

export default LoginValidator
