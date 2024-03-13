import { IUser } from '../../models/userModel'
import { Dictionary } from '../dictionary'
import { Locale } from '../locale'

declare global {
  namespace Express {
    export interface Request {}
  }
  var locale: Locale
  var dictionary: Dictionary
}

declare module 'express-session' {
  export interface SessionData {
    user?: IUser
  }
}

export {}
