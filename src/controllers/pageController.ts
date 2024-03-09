import express from 'express'

const homePage = async (req: express.Request, res: express.Response) => {
  res.render('index')
}

const adminPage = async (req: express.Request, res: express.Response) => {
  res.render('admin')
}

export { adminPage, homePage }
