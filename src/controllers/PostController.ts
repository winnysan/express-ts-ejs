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
      // Extract title and body from the request
      let { title, body } = req.body

      // Process uploaded images, if any
      const images = req.files
        ? (req.files as Express.Multer.File[]).map((file, index) => {
            const uuid = uuidv4() // Generate a unique UUID for the image
            const tempPath = file.path // Temporary upload path
            const extension = path.extname(file.originalname) // Get the file extension
            const targetPath = path.join('uploads/', `${uuid}${extension}`) // Define the target path for the image

            // Move the file from the temporary path to the target path
            fs.move(tempPath, targetPath, err => {
              if (err) throw new Error(Message.getErrorMessage(err))
            })

            // Return metadata about the uploaded image
            return {
              uuid,
              name: file.originalname,
              filename: `${uuid}${extension}`,
              extension,
              mime: file.mimetype,
              size: file.size,
              order: index + 1,
              createdAt: new Date(),
            }
          })
        : []

      // Update the body with the new image paths
      images.forEach(image => {
        const regex = new RegExp(`(<img[^>]+src=["']${image.name}["'][^>]*>)`, 'g')
        body = body.replace(regex, `<img src="/uploads/${image.filename}" alt="${image.name}">`)
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
   * Edits an existing post and returns the updated post in JSON format.
   *
   * @param {express.Request} req - The Express request object containing the updated post data and uploaded files.
   * @param {express.Response} res - The Express response object used to send the JSON response.
   * @returns {Promise<void>} A JSON response with the updated post, including its slug.
   *
   * @description This method handles the editing of an existing post. It first retrieves the post from the database
   * using the provided post ID. It processes any uploaded images, updating their paths in the post body if necessary,
   * and manages the existing images by checking their UUIDs against the images present in the updated post body.
   *
   * If any errors occur during the image upload, file operations, or database updates, they are caught and an
   * appropriate error message is generated. Upon successful update of the post, the method returns a JSON response
   * containing the slug of the updated post. This response format is designed for easy client-side redirection
   * to the updated post.
   */
  public editPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    try {
      // Retrieve the post by ID
      const post = await Post.findById(req.params.id)
      if (!post) {
        return res.status(404).json({ errors: [{ msg: 'Post not found' }] }) // Handle case where post is not found
      }

      // Extract updated title and body from the request
      let { title, body } = req.body

      // Extract all 'src' attributes from the img tags in the post body
      const usedImageUuids = new Set<string>()
      const imgSrcRegex = /<img[^>]+src=["']\/uploads\/([a-f0-9\-]+)\.([a-zA-Z0-9]+)["']/g
      let match
      while ((match = imgSrcRegex.exec(body)) !== null) {
        const uuid = match[1]
        const extension = match[2]
        if (uuid && extension) {
          usedImageUuids.add(uuid) // Add used UUIDs to the set
        }
      }

      // Process uploaded files
      const newImages = req.files
        ? (req.files as Express.Multer.File[]).map((file, index) => {
            const uuid = uuidv4() // Generate a unique UUID for the new image
            const extension = path.extname(file.originalname) // Get the file extension
            const targetFilename = `${uuid}${extension}`
            const targetPath = path.join('uploads/', targetFilename) // Define the target path for the new image

            // Move the file from the temporary path to the target path
            fs.moveSync(file.path, targetPath)

            // Update the body with the new image paths
            function escapeRegExp(string: string): string {
              return string.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&')
            }

            // Regex to find the img tag with the original file name
            const regex = new RegExp(`<img[^>]+src=["'][^"']*${escapeRegExp(file.originalname)}["'][^>]*>`, 'g')
            body = body.replace(regex, `<img src="/uploads/${targetFilename}" alt="${file.originalname}">`)

            // Add the new UUID to the set of used images
            usedImageUuids.add(uuid)

            return {
              uuid,
              name: file.originalname,
              extension,
              mime: file.mimetype,
              size: file.size,
              order: post.images.length + index + 1,
              createdAt: new Date(),
            }
          })
        : []

      // Merge images: existing images that are still used, plus new images
      const updatedImages = []
      for (const image of post.images) {
        if (usedImageUuids.has(image.uuid)) {
          // The image is still used
          updatedImages.push(image)
        } else {
          // The image is no longer used; remove it from the filesystem
          const filePath = path.join('uploads/', `${image.uuid}${image.extension}`)
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
   * Retrieves a post by its slug and returns it in JSON format.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns JSON response with the post matching the provided slug.
   * @description This method fetches a post based on its slug. If the post is not found, an error
   * is thrown. Otherwise, it returns the post in a JSON format.
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
          post,
          user: req.session.user,
          isAuthor,
        })
      }
    } catch (err: unknown) {
      throw new Error(Message.getErrorMessage(err))
    }
  })
}

export default new PostController()
