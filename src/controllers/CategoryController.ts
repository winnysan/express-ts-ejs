import express from 'express'
import AsyncHandler from '../lib/AsyncHandler'
import Category, { ICategory } from '../models/Category'

class CategoryController {
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
        order: cat.order,
        children: this.nestedCategories(categories, cat._id.toString()),
      })
    }
    return categoryList
  }
}

export default new CategoryController()
