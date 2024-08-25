import { body } from 'express-validator'
import User from '../../models/userModel'

class RegisterValidator {
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
