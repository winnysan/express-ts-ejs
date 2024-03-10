import express from 'express'
import fs from 'fs'
import { Domain } from '../types/enums'
import { locale } from '../types/locale'

const localizationMiddleware = (
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  const host = req.get('host')
  const domain = host?.slice(0, host.indexOf(':')).split('.').pop()

  let file: string

  switch (domain) {
    case Domain.COM:
      file = `./src/locale/${locale.locales[1]}.json`
      break
    default:
      file = `./src/locale/${locale.locales[0]}.json`
      break
  }

  fs.readFile(file, 'utf8', (err, data) => {
    if (err) {
      res.send('Error loading language file')
    } else {
      global.locale = JSON.parse(data)
      next()
    }
  })
}

export default localizationMiddleware
