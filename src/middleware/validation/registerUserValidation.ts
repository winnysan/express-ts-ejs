import express from 'express'
import { body, validationResult } from 'express-validator'
import User from '../../models/userModel'

const registerSchema = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage(() => global.locale.validation.isRequired),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email sa vyžaduje')
    .isEmail()
    .normalizeEmail()
    .withMessage('Email je neplatný')
    .custom(async value => {
      const user = await User.findOne({ email: value })
      if (user) {
        throw new Error('Email už existuje')
      }
      return true
    }),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Heslo sa vyžaduje')
    .isLength({ min: 6 })
    .withMessage('Heslo musí mať aspoň 6 znakov'),
  body('confirmPassword')
    .trim()
    .notEmpty()
    .withMessage('Potvrdenie hesla sa vyžaduje')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Heslá sa musia zhodovať')
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
    })
  } else {
    next()
  }
}

export { registerSchema, validateRegisterSchema }
