import express from 'express'

const registerPage = async (req: express.Request, res: express.Response) => {
  res.render('register', { user: req.session.user, title: 'Register page' })
}

const loginPage = async (req: express.Request, res: express.Response) => {
  res.render('login', { user: req.session.user, title: 'Login page' })
}

const adminPage = async (req: express.Request, res: express.Response) => {
  res.render('admin', { user: req.session.user, title: 'Admin page' })
}

const dashboardPage = async (req: express.Request, res: express.Response) => {
  res.render('dashboard', { user: req.session.user, title: 'Dashboard page' })
}

export { adminPage, dashboardPage, loginPage, registerPage }
