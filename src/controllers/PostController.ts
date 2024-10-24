import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import AsyncHandler from '../lib/AsyncHandler'
import Logger from '../lib/Logger'
import { ProcessImage } from '../lib/ProcessImages'
import StringHelper from '../lib/StringHelper'
import Category from '../models/Category'
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
   * @description Fetches posts from the database with pagination and renders the homepage.
   */
  public getPosts = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    const limit: number = parseInt(process.env.PER_PAGE!) || 10
    const page: number = Number(req.query.page) || 1

    const posts: IPost[] = await Post.find()
      .populate('author', 'name')
      .populate('categories', 'name')
      .sort({ updatedAt: -1 })
      .skip(page * limit - limit)
      .limit(limit)

    const total: number = await Post.countDocuments()
    const nextPage = page + 1
    const hasNextPage = nextPage <= Math.ceil(total / limit)

    res.render('index', {
      user: req.session.user,
      messages: req.flash('info'),
      posts,
      current: page,
      nextPage: hasNextPage ? nextPage : null,
      title: global.dictionary.title.homePage,
      layout: res.locals.isAjax ? false : 'layouts/main',
    })
  })

  /**
   * Searches for posts based on a search term.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns JSON response with search results and search term.
   * @description Performs a search on posts using a diacritics-insensitive regex.
   */
  public searchInPosts = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
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
  })

  /**
   * Renders the page for creating a new post.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'post/new-post' view with the title for the new post page.
   * @description Renders the page for users to create a new post.
   */
  public newPostPage = async (req: express.Request, res: express.Response) => {
    const categories = await Category.find()

    res.render('post/new', {
      user: req.session.user,
      title: global.dictionary.title.newPostPage,
      layout: res.locals.isAjax ? false : 'layouts/main',
      categories,
    })
  }

  /**
   * Creates a new post in the database with the provided title and body.
   * Processes any uploaded images and updates the body with the new image paths.
   * @param req - The request object containing the post data and files.
   * @param res - The response object used to send the JSON response.
   * @returns A promise that resolves when the post is created and the response is sent.
   * @description Handles post creation with image processing and database storage.
   */
  public newPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    let { title, body, categories } = req.body

    const images = req.files
      ? await Promise.all(
          (req.files as Express.Multer.File[]).map(async (file, index) => {
            const originalName = file.originalname
            const uuid = uuidv4()

            file = await new ProcessImage(file)
              .resize({ width: 600, height: 600, fit: 'inside' })
              .convert({ format: 'avif', quality: 50 })
              .save()

            const extension = path.extname(file.originalname)
            const filename = `${uuid}${extension}`
            const targetPath = path.join('uploads/', filename)
            const thumbPath = path.join('uploads/thumbs/', filename)

            await new ProcessImage(file)
              .resize({ width: 100, height: 100, crop: true })
              .convert({ quality: 60 })
              .saveAs(thumbPath)

            await fs.move(file.path, targetPath)

            const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${originalName}\\)`, 'g')
            const imageUrl = `/uploads/${filename}`
            body = body.replace(regex, `![$1](${imageUrl})`)

            return {
              uuid,
              name: file.originalname,
              extension,
              mime: file.mimetype,
              size: file.size,
              order: index + 1,
              createdAt: new Date(),
            }
          })
        )
      : []

    const post = await Post.create({
      author: req.session.user!._id,
      title: title,
      body: body,
      slug: `${StringHelper.slugify(title)}-${Date.now()}`,
      images,
      categories,
    })

    res.json({ redirect: `/post/${post.slug}` })
  })

  /**
   * Edits an existing post in the database.
   * Updates the title, body, and images associated with the post.
   * @param req - The request object containing the post ID and updated data.
   * @param res - The response object used to send the JSON response.
   * @returns A promise that resolves when the post is updated and the response is sent.
   * @description Updates a post, replacing images and updating content.
   */
  public editPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    const post = await Post.findById(req.params.id)
    if (!post) {
      res.status(404)

      throw new Error(`${req.originalUrl} ${global.dictionary.messages.notFound}`)
    }

    let { title, body, categories } = req.body

    const usedImageUrls = new Set<string>()
    const imageMarkdownRegex = /!\[[^\]]*\]\(([^)]+)\)/g
    let match
    while ((match = imageMarkdownRegex.exec(body)) !== null) {
      const imageUrl = match[1]
      if (imageUrl) {
        usedImageUrls.add(imageUrl)
      }
    }

    const newImages = req.files
      ? await Promise.all(
          (req.files as Express.Multer.File[]).map(async (file, index) => {
            const originalName = file.originalname
            const uuid = uuidv4()

            file = await new ProcessImage(file)
              .resize({ width: 600, height: 600, fit: 'inside' })
              .convert({ format: 'avif', quality: 50 })
              .save()

            const extension = path.extname(file.originalname)
            const filename = `${uuid}${extension}`
            const targetPath = path.join('uploads/', filename)
            const thumbPath = path.join('uploads/thumbs/', filename)

            await new ProcessImage(file)
              .resize({ width: 100, height: 100, crop: true })
              .convert({ quality: 60 })
              .saveAs(thumbPath)

            await fs.move(file.path, targetPath)

            const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${originalName}\\)`, 'g')
            const imageUrl = `/uploads/${filename}`
            body = body.replace(regex, `![$1](${imageUrl})`)

            usedImageUrls.add(imageUrl)

            return {
              uuid,
              name: originalName,
              extension,
              mime: file.mimetype,
              size: file.size,
              order: post.images.length + index + 1,
              createdAt: new Date(),
            }
          })
        )
      : []

    const updatedImages = []
    for (const image of post.images) {
      const imageUrl = `/uploads/${image.uuid}${image.extension}`

      if (usedImageUrls.has(imageUrl)) {
        updatedImages.push(image)
      } else {
        const filePath = path.join('uploads/', image.uuid + image.extension)
        const filePathThumb = path.join('uploads/thumbs/', image.uuid + image.extension)

        try {
          await fs.unlink(filePath)
          await fs.unlink(filePathThumb)
        } catch (err: unknown) {
          Logger.logToFile(err)
        }
      }
    }

    updatedImages.push(...newImages)

    post.title = title
    post.body = body
    post.images = updatedImages
    post.categories = categories

    await post.save()

    res.json({ redirect: `/post/${post.slug}` })
  })

  /**
   * Retrieves a post by its slug and renders it in the response.
   * Parses the markdown body into HTML for rendering.
   * @param req - The request object containing the post slug.
   * @param res - The response object used to render the post view.
   * @returns A promise that resolves when the post is rendered.
   * @description Fetches a post by slug and renders it with parsed markdown content.
   */
  public getPostBySlug = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    const post = await Post.findOne({ slug: req.params.slug }).populate('author', 'name').populate('categories', 'name')

    if (!post) {
      res.status(404)

      throw new Error(`${req.originalUrl} ${global.dictionary.messages.notFound}`)
    } else {
      const isAuthor = req.session.user ? req.session.user._id.equals(post?.author._id) : false

      const categories = await Category.find()

      res.render('post', {
        parsedBody: StringHelper.parseBody(post.body),
        post,
        user: req.session.user,
        isAuthor,
        title: post.title,
        layout: res.locals.isAjax ? false : 'layouts/main',
        categories,
      })
    }
  })
}

export default new PostController()
