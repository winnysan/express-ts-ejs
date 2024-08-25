import bcrypt from 'bcryptjs'
import express from 'express'
import destroyUserSession from '../lib/destroyUserSession'
import generateAuthToken from '../lib/generateAuthToken'
import Message from '../lib/Message'
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

      req.flash('info', global.dictionary.messages.youAreRegisteredAndLoggedIn)
      res.redirect('/')
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
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

        req.flash('info', global.dictionary.messages.youAreLoggedIn)
        res.redirect('/')
      } else {
        res.render('login', {
          alert: [{ msg: global.dictionary.messages.invalidCredentials }],
          fill: { email: req.body.email },
          title: global.dictionary.title.loginPage,
        })
      }
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  }
)

/**
 * Logout user
 */
const logoutUser = (req: express.Request, res: express.Response) => {
  destroyUserSession(req, res)
}

export { authUser, logoutUser, registerUser }
