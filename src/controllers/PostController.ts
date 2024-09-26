import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import AsyncHandler from '../lib/AsyncHandler'
import Message from '../lib/Message'
import StringHelper from '../lib/StringHelper'
import Post, { IPost } from '../models/Post'

/**
 * Controller for handling post-related operations.
 */
class PostController {
  /**
   * Retrieves and renders posts for the homepage with pagination.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'index' view with posts, current page, and next page information.
   * @description This method fetches posts from the database, supports pagination, and renders
   * the homepage with the posts. It includes pagination controls to navigate through the posts.
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
   * Retrieves and renders posts created by the currently logged-in user.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'dashboard' view with posts created by the current user.
   * @description This method fetches posts authored by the currently logged-in user and
   * renders the dashboard page with these posts.
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
   * Searches for posts based on a search term.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns JSON response with search results and search term.
   * @description This method performs a search on the posts based on the provided search term.
   * It uses a diacritics-insensitive regex for the search and returns the matching posts in a JSON format.
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
   * Renders the page for creating a new post.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'dashboard/new-post' view with the title for the new post page.
   * @description This method renders the page where users can create a new post. It includes the
   * current user session and the title for the new post page.
   */
  public newPostPage = async (req: express.Request, res: express.Response) => {
    res.render('dashboard/new-post', {
      user: req.session.user,
      title: global.dictionary.title.newPostPage,
    })
  }

  /**
   * Creates a new post and returns the created post in JSON format.
   *
   * @param {express.Request} req - The Express request object containing the post data and uploaded files.
   * @param {express.Response} res - The Express response object used to send the JSON response.
   * @returns {Promise<void>} A JSON response with the newly created post, including its slug.
   *
   * @description This method handles the creation of a new post. It processes any uploaded images by moving them
   * from the temporary upload directory to the target `uploads/` directory. For each uploaded image, it generates
   * metadata including a unique UUID, original file name, file extension, MIME type, file size, order of the image,
   * and creation timestamp. This metadata, along with the post data, is stored in the database. The post title is used
   * to generate a unique slug, which is appended with a timestamp to ensure uniqueness.
   *
   * If any errors occur during the file move operation or database operations, they are caught, and an appropriate error
   * message is generated. Upon successful creation of the post, the method returns a JSON response containing the slug
   * of the newly created post. The response format is designed for easy client-side redirection to the newly created post.
   */
  public newPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const { title, body } = req.body

      const images = req.files
        ? (req.files as Express.Multer.File[]).map((file, index) => {
            const uuid = uuidv4()
            const tempPath = file.path
            const targetPath = path.join('uploads/', `${uuid}${path.extname(file.originalname)}`)

            fs.move(tempPath, targetPath, err => {
              if (err) throw new Error(Message.getErrorMessage(err))
            })

            return {
              uuid,
              name: file.originalname,
              extension: path.extname(file.originalname),
              mime: file.mimetype,
              size: file.size,
              order: index + 1,
              createdAt: new Date(),
            }
          })
        : []

      const post = await Post.create({
        author: req.session.user!._id,
        title: title,
        body: body,
        slug: `${StringHelper.slugify(title)}-${Date.now()}`,
        images,
      })

      res.json({ redirect: `/post/${post.slug}` })
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Retrieves a post by its slug and returns it in JSON format.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns JSON response with the post matching the provided slug.
   * @description This method fetches a post based on its slug. If the post is not found, an error
   * is thrown. Otherwise, it returns the post in a JSON format.
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
