import express from 'express'

/**
 * A utility class for handling asynchronous route handlers and middleware.
 * Wraps async functions to catch and handle errors automatically.
 */
class AsyncHandler {
  /**
   * Wraps an asynchronous function to handle errors automatically.
   * @param fn - An asynchronous function to be wrapped.
   * @returns A function that takes `req`, `res`, and `next` parameters and returns a promise.
   * @description This method takes an asynchronous function `fn` as an argument and returns a
   * new function that handles promise rejections by passing errors to the `next` middleware.
   * This is useful for simplifying error handling in route handlers and middleware.
   */
  public wrap(fn: any) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      Promise.resolve(fn(req, res, next)).catch(next)
    }
  }
}

export default new AsyncHandler()
