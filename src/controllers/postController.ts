import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import Message from '../lib/Message'
import StringHelper from '../lib/StringHelper'
import Post, { IPost } from '../models/postModel'

class PostController {
  /**
   * Get posts
   */
  public getPosts = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
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
        title: global.dictionary.title.homePage,
        posts,
        current: page,
        nextPage: hasNextPage ? nextPage : null,
      })
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Get posts by user ID
   */
  public getPostsByUserID = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const posts: IPost[] = await Post.find({
        author: req.session.user?._id,
      }).sort({ updatedAt: -1 })

      res.render('dashboard', {
        user: req.session.user,
        messages: req.flash('info'),
        title: global.dictionary.title.dashboardPage,
        posts,
      })
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Search in posts
   */
  public searchInPosts = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const searchTerm = req.body.searchTerm

      const posts: IPost[] = await Post.find({
        $or: [
          {
            title: {
              $regex: StringHelper.diacriticsInsensitiveRegex(searchTerm),
              $options: 'i',
            },
          },
          {
            body: {
              $regex: StringHelper.diacriticsInsensitiveRegex(searchTerm),
              $options: 'i',
            },
          },
        ],
      }).sort({ updatedAt: -1 })

      res.json({ searchTerm, posts })
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * New post page
   */
  public newPostPage = async (req: express.Request, res: express.Response) => {
    res.render('dashboard/new-post', {
      user: req.session.user,
      title: global.dictionary.title.newPostPage,
    })
  }

  /**
   * New post
   */
  public newPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const { title, body } = req.body

      const post = await Post.create({
        author: req.session.user!._id,
        title: title,
        body: body,
        slug: `${StringHelper.slugify(title)}-${Date.now()}`,
      })

      res.json(post)
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Get post by slug
   */
  public getPostBySlug = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const slug = req.params.slug

      const post = await Post.findOne({ slug })

      if (!post) {
        throw new Error(`${req.originalUrl} ${global.dictionary.messages.notFound}`)
      } else {
        res.json(post)
      }
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })
}

export default new PostController()
