import express from 'express'

/**
 * Destroy user session
 */
const destroyUserSession = (req: express.Request, res: express.Response) => {
  res.cookie('authToken', '', {
    httpOnly: true,
    expires: new Date(0),
  })

  delete req.session.user

  req.flash('info', 'Logout')
  res.redirect('/')
}

export default destroyUserSession
