import bcrypt from 'bcryptjs'
import express from 'express'
import generateAuthToken from '../lib/generateAuthToken'
import getErrorMessage from '../lib/getErrorMessage'
import asyncHandler from '../middleware/asyncHandler'
import User from '../models/userModel'
import { Role } from '../types/enums'

/**
 * Register user
 */
const registerUser = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, name, password } = req.body
      const isAdmin: boolean = process.env.ADMIN_USER === email

      const user = await User.create({
        email,
        name,
        password: await bcrypt.hash(password, await bcrypt.genSalt(10)),
        role: isAdmin ? Role.ADMIN : undefined,
      })
      user.password = ''
      generateAuthToken(res, user._id.toString())

      res.redirect('/')
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

/**
 * Auth user
 */
const authUser = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const { email, password } = req.body

      const user = await User.findOne({ email })

      if (user && (await bcrypt.compare(password, user.password!))) {
        user.password = ''
        generateAuthToken(res, user._id.toString())

        res.redirect('/')
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

export { authUser, registerUser }
