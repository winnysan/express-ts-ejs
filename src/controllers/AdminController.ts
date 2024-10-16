import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import Category, { ICategory } from '../models/Category'

/**
 * Controller for handling page rendering requests in the admin section.
 */
class AdminController {
  /**
   * Renders the admin page.
   * @param req - The HTTP request object.
   * @param res - The HTTP response object.
   * @returns Renders the 'admin' view with user data and page title.
   * @description Renders the admin page, using the main layout unless the request is an AJAX request.
   */
  public adminPage(req: express.Request, res: express.Response): void {
    res.render('admin', {
      user: req.session.user,
      title: global.dictionary.title.adminPage,
      layout: res.locals.isAjax ? false : 'layouts/main',
    })
  }

  public categoriesPage = AsyncHandler.wrap(async (req: express.Request, res: express.Response): Promise<void> => {
    const categories = await Category.find()

    res.render('admin/categories', {
      user: req.session.user,
      title: global.dictionary.title.adminPage,
      layout: res.locals.isAjax ? false : 'layouts/main',
      categories: this.nestedCategories(categories),
    })
  })

  private nestedCategories(categories: ICategory[], parentId: string | null = null): any {
    const categoryList = []
    let category
    if (parentId == null) {
      category = categories.filter(cat => cat.parent_id == null)
    } else {
      category = categories.filter(cat => String(cat.parent_id) == String(parentId))
    }

    for (let cat of category) {
      categoryList.push({
        id: cat._id.toString(),
        name: cat.name,
        children: this.nestedCategories(categories, cat._id.toString()),
      })
    }
    return categoryList
  }
}

export default new AdminController()
