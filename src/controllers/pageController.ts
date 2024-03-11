import express from 'express'

const homePage = async (req: express.Request, res: express.Response) => {
  res.render('index', { user: req.session.user, messages: req.flash('info') })
}

const registerPage = async (req: express.Request, res: express.Response) => {
  res.render('register')
}

const loginPage = async (req: express.Request, res: express.Response) => {
  res.render('login')
}

const adminPage = async (req: express.Request, res: express.Response) => {
  res.render('admin', { user: req.session.user })
}

const dashboardPage = async (req: express.Request, res: express.Response) => {
  res.render('dashboard', { user: req.session.user })
}

export { adminPage, dashboardPage, homePage, loginPage, registerPage }
