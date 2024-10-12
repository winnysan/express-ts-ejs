import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'
import Message from './Message'

/**
 * Class for processing image files, including resizing and format conversion.
 */
export class ProcessImage {
  private file: Express.Multer.File
  private image: sharp.Sharp | null = null

  /**
   * Initializes an instance of ProcessImage with the provided file.
   * Loads the image file and initializes a sharp instance.
   * @param {Express.Multer.File} file - The image file to process.
   * @throws {Error} Throws an error if there is a problem reading the file.
   */
  constructor(file: Express.Multer.File) {
    this.file = file
    if (['image/jpeg', 'image/png', 'image/gif'].includes(this.file.mimetype)) {
      this.loadImage()
    }
  }

  /**
   * Loads the image file into a buffer and initializes sharp.
   * @private
   * @returns {void}
   * @throws {Error} Throws an error if there is a problem reading the file.
   */
  private loadImage(): void {
    try {
      const buffer = fs.readFileSync(this.file.path)
      this.image = sharp(buffer)
    } catch (err) {
      throw new Error(Message.getErrorMessage(err))
    }
  }

  /**
   * Resizes the image according to the provided options.
   * @param {sharp.ResizeOptions} options - Options for resizing the image.
   * @returns {ProcessImage} Returns the instance for method chaining.
   */
  public resize(options: sharp.ResizeOptions): ProcessImage {
    if (this.image) {
      this.image = this.image.resize(options)
    }
    return this
  }

  /**
   * Converts the image to the specified format with optional quality settings.
   * @param {Object} options - Options for image format conversion.
   * @param {'avif' | 'jpeg' | 'png' | 'gif'} options.format - Target image format.
   * @param {number} [options.quality] - Quality of the output image.
   * @returns {ProcessImage} Returns the instance for method chaining.
   */
  public convert(options: { format: 'avif' | 'jpeg' | 'png' | 'gif'; quality?: number }): ProcessImage {
    if (this.image) {
      switch (options.format) {
        case 'avif':
          this.image = this.image.avif({ quality: options.quality })
          break
        case 'jpeg':
          this.image = this.image.jpeg({ quality: options.quality })
          break
        case 'png':
          this.image = this.image.png({ quality: options.quality })
          break
        case 'gif':
          this.image = this.image.gif()
          break
        default:
          break
      }
      // Update file MIME type and extension
      this.file.mimetype = `image/${options.format}`
      const extMap = { jpeg: '.jpg', png: '.png', gif: '.gif', avif: '.avif' }
      const originalExt = path.extname(this.file.originalname)
      const newExt = extMap[options.format]
      this.file.originalname = this.file.originalname.replace(originalExt, newExt)
    }
    return this
  }

  /**
   * Saves the processed image back to the file path.
   * @returns {Promise<Express.Multer.File>} Returns the modified file.
   * @throws {Error} Throws an error if there is a problem writing the file.
   */
  public async save(): Promise<Express.Multer.File> {
    if (this.image) {
      try {
        const buffer = await this.image.toBuffer()
        await fs.writeFile(this.file.path, buffer)
        return this.file
      } catch (err) {
        throw new Error(Message.getErrorMessage(err))
      }
    } else {
      // If no processing is applied, return the original file
      return this.file
    }
  }
}
