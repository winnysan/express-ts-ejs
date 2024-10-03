import express from 'express'

/**
 * Represents a single validation error.
 */
interface ValidationError {
  field: string
  message: string
}

/**
 * Interface for a model with a findOne method.
 */
interface FindOneModel {
  findOne(query: Record<string, any>): Promise<any>
}

/**
 * Class representing validation logic for request fields.
 */
export class Validation {
  private req: express.Request
  public errors: ValidationError[] = []
  private validations: Array<() => Promise<void> | void> = []

  /**
   * Creates an instance of Validation.
   * @param req - The Express request object.
   * @description Initializes the validation instance with the provided request object.
   */
  constructor(req: express.Request) {
    this.req = req
  }

  /**
   * Adds an error to the errors array.
   * @param field - The field name.
   * @param message - The error message.
   * @description Adds a validation error for a specific field.
   */
  addError(field: string, message: string): void {
    this.errors.push({ field, message })
  }

  /**
   * Gets the value of a field from the request.
   * @param name - The field name.
   * @returns The field value.
   * @description Retrieves the value of the specified field from the request body.
   */
  getFieldValue(name: string): any {
    return this.req.body[name]
  }

  /**
   * Gets the uploaded files for a specific field.
   * @param name - The field name.
   * @returns An array of files or undefined.
   * @description Retrieves the uploaded files associated with the specified field name.
   */
  getFiles(name: string): Express.Multer.File[] | undefined {
    let files = this.req.files as Express.Multer.File[]
    files = files.filter(file => file.fieldname === name)

    if (!files) {
      return undefined
    }

    return files
  }

  /**
   * Adds a validation function to the validation list.
   * @param fn - The validation function.
   * @description Adds a validation function to be executed when validations are run.
   */
  addValidation(fn: () => Promise<void> | void): void {
    this.validations.push(fn)
  }

  /**
   * Runs all validation functions.
   * @description Executes all the added validation functions.
   */
  async runValidations(): Promise<void> {
    for (const validationFn of this.validations) {
      await validationFn()
    }
  }

  /**
   * Gets a validator object for a specific field.
   * @param name - The field name to validate.
   * @returns A field validator object with validation methods.
   * @description Creates and returns a FieldValidator for the specified field.
   */
  field(name: string): FieldValidator {
    return new FieldValidator(this, name)
  }
}

/**
 * Class representing validation methods for a specific field.
 */
export class FieldValidator {
  private validation: Validation
  private name: string

  /**
   * Creates an instance of FieldValidator.
   * @param validation - The Validation instance.
   * @param name - The name of the field to validate.
   * @description Initializes the field validator with the provided validation instance and field name.
   */
  constructor(validation: Validation, name: string) {
    this.validation = validation
    this.name = name
  }

  /**
   * Checks if the field is present and not empty.
   * @param message - The error message.
   * @returns The FieldValidator instance.
   * @description Validates that the field is required and non-empty.
   */
  required(message?: string): this {
    this.validation.addValidation(() => {
      const value = this.validation.getFieldValue(this.name)
      if (value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) {
        this.validation.addError(this.name, message || `Field "${this.name}" is required.`)
      }
    })
    return this
  }

  /**
   * Checks if the field contains a valid email address.
   * @param message - The error message.
   * @returns The FieldValidator instance.
   * @description Validates that the field contains a valid email address format.
   */
  email(message?: string): this {
    this.validation.addValidation(() => {
      const value = this.validation.getFieldValue(this.name)
      const re = /\S+@\S+\.\S+/
      if (typeof value === 'string' && !re.test(value)) {
        this.validation.addError(this.name, message || `Invalid email address.`)
      }
    })
    return this
  }

  /**
   * Checks if the field meets the minimum length requirement.
   * @param length - The minimum required length.
   * @param message - The error message.
   * @returns The FieldValidator instance.
   * @description Validates that the field meets the minimum length requirement.
   */
  min(length: number, message?: string): this {
    this.validation.addValidation(() => {
      const value = this.validation.getFieldValue(this.name)
      if (typeof value === 'string' && value.length < length) {
        this.validation.addError(this.name, message || `Field must be at least ${length} characters.`)
      }
    })
    return this
  }

  /**
   * Checks if the field matches another field.
   * @param otherFieldName - The name of the field to compare.
   * @param message - The error message.
   * @returns The FieldValidator instance.
   * @description Validates that the field value matches the value of another field.
   */
  confirm(otherFieldName: string, message?: string): this {
    this.validation.addValidation(() => {
      const value = this.validation.getFieldValue(this.name)
      const otherValue = this.validation.getFieldValue(otherFieldName)
      if (value !== otherValue) {
        this.validation.addError(this.name, message || `Field "${this.name}" does not match "${otherFieldName}".`)
      }
    })
    return this
  }

  /**
   * Checks if the uploaded files have valid MIME types.
   * @param types - Array of allowed MIME types.
   * @param message - The error message.
   * @returns The FieldValidator instance.
   * @description Validates that the uploaded files have allowed MIME types.
   */
  mimetype(types: string[], message?: string): this {
    this.validation.addValidation(() => {
      const files = this.validation.getFiles(this.name)
      if (!files || files.length === 0) {
        return
      }

      for (const file of files) {
        if (!types.includes(file.mimetype)) {
          this.validation.addError(this.name, message || `Invalid file format.`)
          break
        }
      }
    })
    return this
  }

  /**
   * Checks if the field value is unique in the database.
   * @param model - The model to check for uniqueness.
   * @param fieldName - The field name in the model (optional).
   * @param message - The error message.
   * @returns The FieldValidator instance.
   * @description Validates that the field value is unique in the provided model.
   */
  unique(model: FindOneModel, fieldName?: string, message?: string): this {
    this.validation.addValidation(async () => {
      const value = this.validation.getFieldValue(this.name)
      if (value === undefined || value === null || value === '') {
        return
      }

      const queryField = fieldName || this.name
      try {
        const exist = await model.findOne({ [queryField]: value })
        if (exist) {
          this.validation.addError(this.name, message || `Field "${this.name}" must be unique.`)
        }
      } catch (error) {
        this.validation.addError(this.name, `Error checking uniqueness for field "${this.name}".`)
      }
    })
    return this
  }
}
