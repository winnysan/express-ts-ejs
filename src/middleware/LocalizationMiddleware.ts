import express from 'express'
import fs from 'fs'
import { Domain } from '../types/enums'
import { locale } from '../types/locale'

/**
 * Middleware class for handling localization based on the request's domain.
 * This middleware sets the appropriate locale and loads the corresponding
 * localization file based on the domain of the request.
 */
class LocalizationMiddleware {
  private host: string | undefined
  private domain: string | undefined
  private file: string | undefined

  constructor() {
    this.use = this.use.bind(this)
  }

  /**
   * Middleware function to determine the locale based on the request domain
   * and load the corresponding localization file.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @returns {void}
   * @description This method reads the locale file based on the domain extracted from
   * the request host. It sets the global locale and dictionary for localization.
   * If the locale file cannot be read or determined, it sends an error message.
   */
  public use(req: express.Request, res: express.Response, next: express.NextFunction): void {
    this.host = req.get('host')
    this.domain = this.host?.slice(0, this.host.indexOf(':')).split('.').pop()

    switch (this.domain) {
      case Domain.COM:
        this.file = `./src/locale/${locale.locales[1]}.json`
        global.locale = locale.locales[1]
        break
      default:
        this.file = `./src/locale/${locale.locales[0]}.json`
        global.locale = locale.locales[0]
        break
    }

    if (this.file) {
      fs.readFile(this.file, 'utf8', (err, data) => {
        if (err) {
          res.send('Error loading language file')
        } else {
          global.dictionary = JSON.parse(data)
          next()
        }
      })
    } else {
      res.send('Error determining the language file')
    }
  }
}

export default new LocalizationMiddleware()
