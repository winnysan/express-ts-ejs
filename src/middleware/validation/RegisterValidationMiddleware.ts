import express from 'express'
import { validationResult } from 'express-validator'

class RegisterValidationMiddleware {
  public validate(req: express.Request, res: express.Response, next: express.NextFunction) {
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
}

export default new RegisterValidationMiddleware()
