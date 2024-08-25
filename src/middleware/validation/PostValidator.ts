import { body } from 'express-validator'

class PostValidator {
  public static getPostSchema() {
    return [
      body('title')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.isRequired),
      body('body')
        .trim()
        .notEmpty()
        .withMessage(() => global.dictionary.validation.isRequired),
    ]
  }
}

export default PostValidator
