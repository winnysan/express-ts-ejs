import express from 'express'

const homePage = async (req: express.Request, res: express.Response) => {
  res.render('index')
}

const adminPage = async (req: express.Request, res: express.Response) => {
  res.render('admin')
}

const dashboardPage = async (req: express.Request, res: express.Response) => {
  res.render('admin/dashboard', { user: req.user })
}

export { adminPage, dashboardPage, homePage }
