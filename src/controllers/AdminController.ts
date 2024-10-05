import express from 'express'

/**
 * Controller for handling page rendering requests in the admin section.
 */
class AdminController {
  /**
   * Renders the admin page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'admin' view with user data and page title.
   * @description Renders the admin page, using the main layout unless the request is an AJAX request.
   */
  public adminPage(req: express.Request, res: express.Response): void {
    res.render('admin', {
      user: req.session.user,
      title: global.dictionary.title.adminPage,
      layout: res.locals.isAjax ? false : 'layouts/main',
    })
  }
}

export default new AdminController()
