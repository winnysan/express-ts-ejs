import fs from 'fs-extra'
import path from 'path'
import sharp from 'sharp'
import Message from './Message'

/**
 * Class for processing images, including resizing, format conversion, and saving.
 */
export class ProcessImage {
  private file: Express.Multer.File
  private image: sharp.Sharp | null = null
  private format?: 'avif' | 'jpeg' | 'png' | 'gif'

  /**
   * Initializes an instance of ProcessImage with the provided file.
   * @param {Express.Multer.File} file - The image file to be processed.
   * @description Loads the image file and sets the format based on the file's MIME type.
   */
  constructor(file: Express.Multer.File) {
    this.file = file
    if (['image/jpeg', 'image/png', 'image/gif', 'image/avif'].includes(this.file.mimetype)) {
      const inputBuffer = fs.readFileSync(this.file.path)
      this.image = sharp(inputBuffer)
      this.format = this.file.mimetype.split('/')[1] as 'avif' | 'jpeg' | 'png' | 'gif'
    }
  }

  /**
   * Resizes the image based on provided options.
   * @param {sharp.ResizeOptions & { crop?: boolean }} options - The resize options including an optional crop flag.
   * @returns {ProcessImage} - The instance for method chaining.
   * @description Resizes the image with optional cropping based on the given options.
   */
  public resize(options: sharp.ResizeOptions & { crop?: boolean }): ProcessImage {
    if (this.image) {
      const { crop, ...resizeOptions } = options
      if (crop) {
        resizeOptions.fit = 'cover'
      }
      this.image = this.image.resize(resizeOptions)
    }
    return this
  }

  /**
   * Converts the image to the specified format.
   * @param {{ format?: 'avif' | 'jpeg' | 'png' | 'gif'; quality?: number }} options - Format and quality options for the conversion.
   * @returns {ProcessImage} - The instance for method chaining.
   * @description Converts the image to the specified format with optional quality settings.
   * @throws {Error} Throws an error if the format is not specified or set previously.
   */
  public convert(options: { format?: 'avif' | 'jpeg' | 'png' | 'gif'; quality?: number }): ProcessImage {
    if (this.image) {
      const format = options.format || this.format
      if (!format) {
        throw new Error('Format must be specified in options or set previously.')
      }
      this.format = format

      switch (format) {
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

      this.file.mimetype = `image/${format}`
      const extMap = { jpeg: '.jpg', png: '.png', gif: '.gif', avif: '.avif' }
      const originalExt = path.extname(this.file.originalname)
      const newExt = extMap[format]
      this.file.originalname = this.file.originalname.replace(originalExt, newExt)
    }
    return this
  }

  /**
   * Saves the processed image back to the file path.
   * @returns {Promise<Express.Multer.File>} - Returns the modified file.
   * @throws {Error} Throws an error if saving the file fails.
   * @description Saves the processed image to the original file path.
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
      return this.file
    }
  }

  /**
   * Saves the processed image to a specified target path.
   * @param {string} targetPath - The target file path where the image will be saved.
   * @returns {Promise<Express.Multer.File>} - Returns the new file with updated path information.
   * @throws {Error} Throws an error if saving the file fails.
   * @description Saves the processed image to a specified path or copies the original file if no processing is applied.
   */
  public async saveAs(targetPath: string): Promise<Express.Multer.File> {
    if (this.image) {
      try {
        await this.image.toFile(targetPath)
        const newFile: Express.Multer.File = {
          ...this.file,
          path: targetPath,
          filename: path.basename(targetPath),
        }
        return newFile
      } catch (err) {
        throw new Error(Message.getErrorMessage(err))
      }
    } else {
      await fs.copyFile(this.file.path, targetPath)
      const newFile: Express.Multer.File = {
        ...this.file,
        path: targetPath,
        filename: path.basename(targetPath),
      }
      return newFile
    }
  }

  /**
   * Returns the file information.
   * @returns {Express.Multer.File} - The file information.
   * @description Retrieves the current state of the file.
   */
  public getFile(): Express.Multer.File {
    return this.file
  }
}
