import express from 'express'

/**
 * Controller for handling page rendering requests.
 */
class PageController {
  /**
   * Renders the registration page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'register' view with user data and page title.
   * @description This method renders the registration page. It passes the current user session and
   * the title for the registration page to the view.
   */
  public registerPage(req: express.Request, res: express.Response): void {
    res.render('register', {
      user: req.session.user,
      title: global.dictionary.title.registerPage,
    })
  }

  /**
   * Renders the login page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'login' view with user data and page title.
   * @description This method renders the login page. It passes the current user session and
   * the title for the login page to the view.
   */
  public loginPage(req: express.Request, res: express.Response): void {
    res.render('login', {
      user: req.session.user,
      title: global.dictionary.title.loginPage,
    })
  }

  /**
   * Renders the dashboard page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'dashboard' view with user data and page title.
   * @description This method renders the dashboard page. It passes the current user session and
   * the title for the dashboard page to the view.
   */
  public dashboardPage(req: express.Request, res: express.Response): void {
    res.render('dashboard', {
      user: req.session.user,
      title: global.dictionary.title.dashboardPage,
    })
  }

  /**
   * Renders the admin page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'admin' view with user data and page title.
   * @description This method renders the admin page. It passes the current user session and
   * the title for the admin page to the view.
   */
  public adminPage(req: express.Request, res: express.Response): void {
    res.render('admin', {
      user: req.session.user,
      title: global.dictionary.title.adminPage,
    })
  }
}

export default new PageController()
