import { Role } from './enums'

export interface IUser {
  name: string
  email: string
  password: string
  role: Role
}
