import express from 'express'
import { validationResult } from 'express-validator'

class PostValidationMiddleware {
  public validate(req: express.Request, res: express.Response, next: express.NextFunction) {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      res.render('dashboard/new-post', {
        alert: errors.array(),
        fill: { postTitle: req.body.title, postBody: req.body.body },
        title: global.dictionary.title.newPostPage,
      })
    } else {
      next()
    }
  }
}

export default new PostValidationMiddleware()
