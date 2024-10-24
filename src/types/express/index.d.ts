import { IUser } from '../../models/User'
import { Dictionary } from '../dictionary'
import { NodeEnv } from '../enums'
import { Locale } from '../locale'

declare global {
  namespace NodeJS {
    export interface ProcessEnv {
      NODE_ENV: NodeEnv.PROD | NodeEnv.DEV
      PORT: number
      CLIENT_ORIGIN: string
      MONGO_URI: string
      ADMIN_USER: string
      JWT_SECRET: string
      SESSION_SECRET: string
      PER_PAGE: string
    }
  }
  namespace Express {
    export interface Request {
      csrfToken?: () => string
    }
  }
  var locale: Locale
  var dictionary: Dictionary
  var env: string | undefined
}

declare module 'express-session' {
  export interface SessionData {
    user?: IUser
  }
}

export {}
