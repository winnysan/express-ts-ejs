import express from 'express'
import fs from 'fs-extra'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import AsyncHandler from '../lib/AsyncHandler'
import Message from '../lib/Message'
import { ProcessImages } from '../lib/ProcessImages'
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
   * Creates a new post in the database with the provided title and body.
   * Processes any uploaded images and updates the body with the new image paths.
   *
   * @param {express.Request} req - The request object containing the post data and files.
   * @param {express.Response} res - The response object used to send the JSON response.
   * @returns {Promise<void>} A promise that resolves when the post is created and the response is sent.
   *
   * @throws {Error} Throws an error if there is an issue with file processing or post creation.
   */
  public newPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      // Extract title and body from the request
      let { title, body } = req.body

      // Process uploaded images, if any
      const images = req.files
        ? await Promise.all(
            (req.files as Express.Multer.File[]).map(async (file, index) => {
              const uuid = uuidv4() // Generate a unique UUID for the image
              const tempPath = file.path // Temporary upload path
              const extension = path.extname(file.originalname) // Get the file extension
              const filename = `${uuid}${extension}`
              const targetPath = path.join('uploads/', filename) // Define the target path for the image

              // Resize the image
              await ProcessImages.resize(file)

              // Move the file from the temporary path to the target path
              await fs.move(tempPath, targetPath)

              // Return metadata about the uploaded image
              return {
                uuid,
                name: file.originalname,
                filename: filename,
                extension,
                mime: file.mimetype,
                size: file.size,
                order: index + 1,
                createdAt: new Date(),
              }
            })
          )
        : []

      // Update the body with the new image paths
      images.forEach(image => {
        const imageMarkdownRegex = new RegExp(`!\\[([^\\]]*)\\]\\(${image.name}\\)`, 'g')
        const imageUrl = `/uploads/${image.filename}`
        body = body.replace(imageMarkdownRegex, `![$1](${imageUrl})`)
      })

      // Create the new post in the database
      const post = await Post.create({
        author: req.session.user!._id,
        title: title,
        body: body,
        slug: `${StringHelper.slugify(title)}-${Date.now()}`, // Generate a unique slug
        images,
      })

      // Respond with a JSON object containing the redirect URL for the newly created post
      res.json({ redirect: `/post/${post.slug}` })
    } catch (err: unknown) {
      // Handle errors and generate an appropriate error message
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Edits an existing post in the database.
   * Updates the title, body, and images associated with the post.
   *
   * @param {express.Request} req - The request object containing the post ID and updated data.
   * @param {express.Response} res - The response object used to send the JSON response.
   * @returns {Promise<void>} A promise that resolves when the post is updated and the response is sent.
   *
   * @throws {Error} Throws an error if the post is not found, or if there is an issue with file processing or updating the post.
   */
  public editPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      // Find the post by ID
      const post = await Post.findById(req.params.id)
      if (!post) {
        return res.status(404).json({ errors: [{ msg: 'Post not found' }] }) // Handle case where the post is not found
      }

      // Get updated title and body from the request
      let { title, body } = req.body

      // Extract all image URLs from markdown syntax in the post body
      const usedImageUrls = new Set<string>()
      const imageMarkdownRegex = /!\[[^\]]*\]\(([^)]+)\)/g
      let match
      while ((match = imageMarkdownRegex.exec(body)) !== null) {
        const imageUrl = match[1] // This is the image URL in markdown syntax
        if (imageUrl) {
          usedImageUrls.add(imageUrl) // Add used image URLs to the set
        }
      }

      // Process uploaded files
      const newImages = req.files
        ? await Promise.all(
            (req.files as Express.Multer.File[]).map(async (file, index) => {
              const uuid = uuidv4() // Generate a unique UUID for the new image
              const extension = path.extname(file.originalname) // Get the file extension
              const filename = `${uuid}${extension}`
              const targetPath = path.join('uploads/', filename) // Define the target path for the new image

              // Resize the image
              await ProcessImages.resize(file)

              // Move the file from the temporary path to the target path
              await fs.move(file.path, targetPath)

              // Update the body with the new image paths
              const originalName = file.originalname

              // Escape special characters in the original file name
              function escapeRegExp(string: string): string {
                return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
              }

              // Regex to find the markdown syntax image with the original file name
              const regex = new RegExp(`!\\[([^\\]]*)\\]\\(${escapeRegExp(originalName)}\\)`, 'g')

              // Replace the image name in the markdown syntax with the new image URL
              const imageUrl = `/uploads/${filename}`
              body = body.replace(regex, `![$1](${imageUrl})`)

              // Add the new image URL to the set of used images
              usedImageUrls.add(imageUrl)

              return {
                uuid,
                name: file.originalname,
                filename: filename,
                extension,
                mime: file.mimetype,
                size: file.size,
                order: post.images.length + index + 1,
                createdAt: new Date(),
              }
            })
          )
        : []

      // Merge images: existing images that are still used, plus new images
      const updatedImages = []
      for (const image of post.images) {
        // Create URL for the image used in the body
        const imageUrl = `/uploads/${image.uuid}${image.extension}`

        if (usedImageUrls.has(imageUrl)) {
          // The image is still used
          updatedImages.push(image)
        } else {
          // The image is no longer used; remove it from the filesystem
          const filePath = path.join('uploads/', image.uuid + image.extension)
          try {
            await fs.unlink(filePath)
          } catch (err) {
            throw new Error(Message.getErrorMessage(err))
          }
        }
      }

      // Add new images to the updated images array
      updatedImages.push(...newImages)

      // Update the post with the new data
      post.title = title
      post.body = body
      post.images = updatedImages

      await post.save()

      // Respond with a JSON object containing the redirect URL for the updated post
      res.json({ redirect: `/post/${post.slug}` })
    } catch (err: unknown) {
      // Handle errors and generate an appropriate error message
      throw new Error(Message.getErrorMessage(err))
    }
  })

  /**
   * Retrieves a post by its slug and renders it in the response.
   * Parses the markdown body into HTML for rendering.
   *
   * @param {express.Request} req - The request object containing the post slug.
   * @param {express.Response} res - The response object used to render the post view.
   * @returns {Promise<void>} A promise that resolves when the post is rendered.
   *
   * @throws {Error} Throws an error if the post is not found or if there is an issue retrieving the post.
   */
  public getPostBySlug = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      const post = await Post.findOne({ slug: req.params.slug })

      if (!post) {
        throw new Error(`${req.originalUrl} ${global.dictionary.messages.notFound}`)
      } else {
        const isAuthor = req.session.user ? req.session.user._id.equals(post?.author) : false

        res.render('post', {
          title: post.title,
          parsedBody: StringHelper.parseBody(post.body), // Parse the markdown body to HTML
          post,
          user: req.session.user,
          isAuthor,
        })
      }
    } catch (err: unknown) {
      // Handle errors and generate an appropriate error message
      throw new Error(Message.getErrorMessage(err))
    }
  })
}

export default new PostController()
