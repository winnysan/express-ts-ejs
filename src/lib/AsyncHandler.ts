import express from 'express'

class AsyncHandler {
  public wrap(fn: any) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}

export default new AsyncHandler()
