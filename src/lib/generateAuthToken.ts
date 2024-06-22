import express from 'express'
import jwt from 'jsonwebtoken'
import { NodeEnv } from '../types/enums'

/**
 * Generate auth token
 * @param res
 * @param userId
 */
const generateAuthToken = (res: express.Response, userId: string) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  })

  res.cookie('authToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== NodeEnv.DEV,
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  })
}

export default generateAuthToken
