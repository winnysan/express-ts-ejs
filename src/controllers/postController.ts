import express from 'express'
import diacriticsInsensitiveRegex from '../lib/diacriticsInsensitiveRegex'
import getErrorMessage from '../lib/getErrorMessage'
import slugify from '../lib/slugify'
import asyncHandler from '../middleware/asyncHandler'
import Post, { IPost } from '../models/postModel'

/**
 * Get posts
 */
const getPosts = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const limit: number = parseInt(process.env.PER_PAGE!) || 10
      const page: number = Number(req.query.page) || 1

      const posts: IPost[] = await Post.find()
        .populate('author', 'name')
        .sort({ updatedAt: -1 })
        .skip(page * limit - limit)
        .limit(limit)

      const total: number = await Post.countDocuments()
      const nextPage = page + 1
      const hasNextPage = nextPage <= Math.ceil(total / limit)

      res.render('index', {
        user: req.session.user,
        messages: req.flash('info'),
        title: 'Home page',
        posts,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
      })
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

/**
 * Search in posts
 */
const searchInPosts = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const searchTerm = req.body.searchTerm

      const posts: IPost[] = await Post.find({
        $or: [
          {
            title: {
              $regex: diacriticsInsensitiveRegex(searchTerm),
              $options: 'i',
            },
          },
          {
            body: {
              $regex: diacriticsInsensitiveRegex(searchTerm),
              $options: 'i',
            },
          },
        ],
      }).sort({ updatedAt: -1 })

      res.json({ searchTerm, posts })
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

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

/**
 * Get post by slug
 */
const getPostBySlug = asyncHandler(
  async (req: express.Request, res: express.Response) => {
    try {
      const slug = req.params.slug

      const post = await Post.findOne({ slug })

      if (!post) {
        throw new Error(getErrorMessage(`${slug} - not found`))
      }
      res.json(post)
    } catch (err: unknown) {
      throw new Error(getErrorMessage(err))
    }
  }
)

export { getPostBySlug, getPosts, newPost, newPostPage, searchInPosts }
