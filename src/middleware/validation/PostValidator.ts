import { body } from 'express-validator'

/**
 * Validator class for post-related validation schemas using `express-validator`.
 */
class PostValidator {
  /**
   * Retrieves the validation schema for post data.
   * @returns {Array} An array of validation chain objects for validating post data.
   * @description This method defines a validation schema for post data, including:
   * - **`title`**: Should be a non-empty string after trimming.
   * - **`body`**: Should be a non-empty string after trimming.
   * - **`images`**: An array of image files. Each image file is validated to ensure its MIME type is either `image/jpeg`, `image/png`, or `image/gif`. If no images are provided, validation passes.
   * Each field is validated to ensure it is not empty, with custom error messages defined.
   * The error messages are retrieved from the global dictionary.
   */
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
      body('images')
        .custom((value, { req }) => {
          console.log('check', req.files)
          if (!req.files || req.files.length === 0) {
            return true
          }
          req.files.forEach((file: Express.Multer.File) => {
            if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
              throw new Error(global.dictionary.validation.invalidImageFormat)
            }
          })
          return true
        })
        .withMessage(() => global.dictionary.validation.invalidImageFormat),
    ]
  }
}

export default PostValidator
