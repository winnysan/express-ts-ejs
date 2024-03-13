import express from 'express'

const registerPage = async (req: express.Request, res: express.Response) => {
  res.render('register', {
    user: req.session.user,
    title: global.dictionary.title.registerPage,
  })
}

const loginPage = async (req: express.Request, res: express.Response) => {
  res.render('login', {
    user: req.session.user,
    title: global.dictionary.title.loginPage,
  })
}

const dashboardPage = async (req: express.Request, res: express.Response) => {
  res.render('dashboard', {
    user: req.session.user,
    title: global.dictionary.title.dashboardPage,
  })
}

const adminPage = async (req: express.Request, res: express.Response) => {
  res.render('admin', {
    user: req.session.user,
    title: global.dictionary.title.adminPage,
  })
}

export { adminPage, dashboardPage, loginPage, registerPage }
