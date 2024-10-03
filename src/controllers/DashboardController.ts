import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import Post, { IPost } from '../models/Post'

/**
 * Controller for handling page rendering requests.
 */
class DashboardController {
  /**
   * Retrieves and renders posts created by the currently logged-in user.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'dashboard' view with posts created by the current user.
   * @description Fetches posts authored by the logged-in user and renders the dashboard with these posts.
   */
  public getPostsByUserID = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    const posts: IPost[] = await Post.find({
      author: req.session.user?._id,
    }).sort({ updatedAt: -1 })

    res.render('dashboard', {
      user: req.session.user,
      messages: req.flash('info'),
      title: global.dictionary.title.dashboardPage,
      posts,
    })
  })
}

export default new DashboardController()
