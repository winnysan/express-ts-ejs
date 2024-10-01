import fs from 'fs-extra'
import sharp from 'sharp'
import Message from './Message'

/**
 * A class for processing image files, including resizing and format conversion.
 */
export class ProcessImages {
  /**
   * Resizes an image to a maximum width or height of 600px.
   * Converts PNG images to JPEG format with a quality of 75%.
   * Supports JPEG, PNG, and GIF image formats.
   *
   * @param {Express.Multer.File} file - The image file to be resized, as provided by Multer.
   * @returns {Promise<string>} A promise that resolves with the path to the resized image file.
   *
   * @throws {Error} Throws an error if there is an issue reading or writing the file.
   */
  public static async resize(file: Express.Multer.File): Promise<string> {
    // Check the file mymeType
    if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      // If the file is not a supported image type, return the original path
      return file.path
    }

    try {
      // Read the image file into a buffer
      const buffer = await fs.readFile(file.path)

      // Initialize sharp with the buffer
      let image = sharp(buffer)

      // Optionally, specify the output format based on MIME type
      switch (file.mimetype) {
        case 'image/jpeg':
          image = image.jpeg({ quality: 75 })
          break
        case 'image/png':
          image = image.jpeg({ quality: 75 })
          break
        case 'image/gif':
          image = image.gif()
          break
        default:
          break
      }

      // Resize the image
      const resizedBuffer = await image.resize({ width: 600, height: 600, fit: 'inside' }).toBuffer()

      // Overwrite the original file with the resized image
      await fs.writeFile(file.path, resizedBuffer)

      return file.path
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  }
}
