import mongoose from 'mongoose'
import { Role } from '../types/enums'
import { IUser } from '../types/interfaces'
import { Timestamps } from '../types/types'

type UserModel = mongoose.Model<IUser & Timestamps>

const userSchema = new mongoose.Schema<IUser, UserModel>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: Role.USER },
  },
  { timestamps: true }
)

const User =
  (mongoose.models?.User as UserModel) ||
  mongoose.model<IUser, UserModel>('User', userSchema)

export default User
