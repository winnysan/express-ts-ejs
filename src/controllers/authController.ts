import bcrypt from 'bcryptjs'
import express from 'express'
import generateAuthToken from '../lib/generateAuthToken'
import getErrorMessage from '../lib/getErrorMessage'
import asyncHandler from '../middleware/asyncHandler'
import User from '../models/userModel'
import { Role } from '../types/enums'

type RegisterReqBody = {
  email: string
  name: string
  password: string
}

type AuthReqBody = {
  email: string
  password: string
}

/**
 * Register user
 */
const register = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, name, password }: RegisterReqBody = req.body
      // validation

      const isAdmin: boolean = process.env.ADMIN_USER === email

      const user = await User.create({
        email,
        name,
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        role: isAdmin ? Role.ADMIN : undefined,
      })

      generateAuthToken(res, user._id.toString())

      delete user.password
      res.redirect('/admin/dashboard')
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

/**
 * Auth user
 */
const auth = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, password }: AuthReqBody = req.body
      // validation

      const user = await User.findOne({ email })

      if (user && (await bcrypt.compare(password, user.password!))) {
        generateAuthToken(res, user._id.toString())

        delete user.password
        res.redirect('/admin/dashboard')
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

export { auth, register }
