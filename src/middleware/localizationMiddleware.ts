import express from 'express'
import fs from 'fs'
import { Domain } from '../types/enums'
import { locale } from '../types/locale'

class LocalizationMiddleware {
  private host: string | undefined
  private domain: string | undefined
  private file: string | undefined

  constructor() {
    this.use = this.use.bind(this)
  }

  public use(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
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
