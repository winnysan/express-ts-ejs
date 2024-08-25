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
   * Each field is validated to ensure it is not empty, with a custom error message defined.
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
    ]
  }
}

export default PostValidator
