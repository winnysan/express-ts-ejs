import express from 'express'
import getErrorMessage from '../lib/getErrorMessage'
import slugify from '../lib/slugify'
import asyncHandler from '../middleware/asyncHandler'
import Post from '../models/postModel'

/**
 * New post page
 */
const newPostPage = async (req: express.Request, res: express.Response) => {
  res.render('dashboard/new-post', {
    user: req.session.user,
    title: 'New post page',
  })
}

/**
 * New post
 */
const newPost = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const { title, body } = req.body

      const post = await Post.create({
        author: req.session.user!._id,
        title: title,
        body: body,
        slug: `${slugify(title)}-${Date.now()}`,
      })

      res.json({ post })
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

export { newPost, newPostPage }
