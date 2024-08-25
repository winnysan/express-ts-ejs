import express from 'express'

class PageController {
  /**
   * Render the register page
   */
  public registerPage(req: express.Request, res: express.Response): void {
    res.render('register', {
      user: req.session.user,
      title: global.dictionary.title.registerPage,
    })
  }

  /**
   * Render the login page
   */
  public loginPage(req: express.Request, res: express.Response): void {
    res.render('login', {
      user: req.session.user,
      title: global.dictionary.title.loginPage,
    })
  }

  /**
   * Render the dashboard page
   */
  public dashboardPage(req: express.Request, res: express.Response): void {
    res.render('dashboard', {
      user: req.session.user,
      title: global.dictionary.title.dashboardPage,
    })
  }

  /**
   * Render the admin page
   */
  public adminPage(req: express.Request, res: express.Response): void {
    res.render('admin', {
      user: req.session.user,
      title: global.dictionary.title.adminPage,
    })
  }
}

export default new PageController()
