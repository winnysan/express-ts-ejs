import { IUser } from '../../models/userModel'
import { Dictionary } from '../dictionary'

declare global {
  namespace Express {
    export interface Request {
      user?: IUser
    }
  }
  var locale: Dictionary
}

export {}
