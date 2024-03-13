import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../../models/userModel'

const registerSchema = [
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
    .withMessage(
      () => global.dictionary.validation.passwordMustHaveAtLeast6Characters
    ),
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

const validateRegisterSchema = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.render('register', {
      alert: errors.array(),
      fill: { email: req.body.email, name: req.body.name },
      title: global.dictionary.title.registerPage,
    })
  } else {
    next()
  }
}

export { registerSchema, validateRegisterSchema }
