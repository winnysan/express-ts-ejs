import mongoose from 'mongoose'
import { Role } from '../types/enums'

export interface IUser extends mongoose.Document {
  _id: mongoose.Types.ObjectId
  name: string
  email: string
  password?: string
  role: Role
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    role: { type: String, required: true, default: Role.USER },
  },
  { timestamps: true }
)

const User = mongoose.model<IUser>('User', userSchema)

export default User
