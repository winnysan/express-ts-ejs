import express from 'express'

/**
 * Middleware class for detecting AJAX requests.
 */
class AjaxMiddleware {
  /**
   * Middleware to check if the request is an AJAX request.
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @param next - The next middleware function in the stack.
   * @description Sets a local variable `isAjax` to true if the request is an AJAX request.
   */
  public isAjax(req: express.Request, res: express.Response, next: express.NextFunction): void {
    res.locals.isAjax = req.xhr
    next()
  }
}

export default new AjaxMiddleware()
