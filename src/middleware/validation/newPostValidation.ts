import express from 'express'
import { body, validationResult } from 'express-validator'

const postSchema = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage(() => global.locale.validation.isRequired),
  body('body')
    .trim()
    .notEmpty()
    .withMessage(() => global.locale.validation.isRequired),
]

const validatePostSchema = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.log('first')
    res.render('dashboard/new-post', {
      alert: errors.array(),
      fill: { postTitle: req.body.title, postBody: req.body.body },
      title: 'New post page',
    })
  } else {
    next()
  }
}

export { postSchema, validatePostSchema }
