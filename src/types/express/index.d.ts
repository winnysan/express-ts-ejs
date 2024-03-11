import { IUser } from '../../models/userModel'
import { Dictionary } from '../dictionary'

declare global {
  namespace Express {
    export interface Request {}
  }
  var locale: Dictionary
}

declare module 'express-session' {
  export interface SessionData {
    user?: IUser
  }
}

export {}
