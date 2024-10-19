import express from 'express'
import mongoose from 'mongoose'
import AsyncHandler from '../../lib/AsyncHandler'
import Category from '../../models/Category'

class ApiCategoryController {
  public categoriesPost = AsyncHandler.wrap(async (req: express.Request, res: express.Response) => {
    const { data } = req.body

    if (!data || !data.action) {
      return res.status(400).json({ message: 'Neplatné dáta' })
    }

    const action = data.action
    let responseData: any = { action, message: 'Success' }

    switch (action) {
      case 'input':
        responseData = await this.updateCategoryName(data)
        break

      case 'addFirst':
        responseData = await this.addFirstCategory()
        break

      case 'add':
        responseData = await this.addCategoryAfter(data)
        break

      case 'addNested':
        responseData = await this.addNestedCategory(data)
        break

      case 'delete':
        responseData = await this.deleteCategory(data)
        break

      case 'up':
        responseData = await this.moveCategoryUp(data)
        break

      case 'down':
        responseData = await this.moveCategoryDown(data)
        break

      default:
        return res.status(400).json({ message: 'Neznáma akcia' })
    }

    res.status(200).json(responseData)
  })

  private async updateCategoryName(data: any) {
    if (!data.id || typeof data.value !== 'string') {
      return { message: 'Neplatné dáta pre úpravu', status: 400 }
    }

    const updatedCategory = await Category.findByIdAndUpdate(data.id, { name: data.value }, { new: true })

    if (!updatedCategory) {
      return { message: 'Kategória nenájdená', status: 404 }
    }

    return { message: 'Success' }
  }

  private async addFirstCategory() {
    const topCategories = await Category.find({ parent_id: null }).sort({ order: -1 }).limit(1)
    const nextOrderFirst = topCategories.length > 0 ? topCategories[0].order + 1 : 1

    const newFirstCategory = new Category({
      name: 'Untitled',
      parent_id: null,
      order: nextOrderFirst,
    })

    const savedFirstCategory = await newFirstCategory.save()
    return { newId: savedFirstCategory._id, message: 'Success' }
  }

  private async addCategoryAfter(data: any) {
    if (!data.after) {
      return { message: 'Chýba ID kategórie, za ktorou sa pridáva nová', status: 400 }
    }

    const afterCategory = await Category.findById(data.after)
    if (!afterCategory) {
      return { message: 'Kategória nenájdená', status: 404 }
    }

    const parentId = afterCategory.parent_id
    const nextOrderAdd = afterCategory.order + 1

    await Category.updateMany({ parent_id: parentId, order: { $gte: nextOrderAdd } }, { $inc: { order: 1 } })

    const newCategory = new Category({
      name: 'Untitled',
      parent_id: parentId,
      order: nextOrderAdd,
    })

    const savedCategory = await newCategory.save()
    return { newId: savedCategory._id, message: 'Success' }
  }

  private async addNestedCategory(data: any) {
    if (!data.nested) {
      return { message: 'Chýba ID nadradenej kategórie', status: 400 }
    }

    const parentCategory = await Category.findById(data.nested)
    if (!parentCategory) {
      return { message: 'Nadradená kategória nenájdená', status: 404 }
    }

    const childCategories = await Category.find({ parent_id: parentCategory._id }).sort({ order: -1 }).limit(1)
    const nextOrderNested = childCategories.length > 0 ? childCategories[0].order + 1 : 1

    const newNestedCategory = new Category({
      name: 'Untitled',
      parent_id: parentCategory._id,
      order: nextOrderNested,
    })

    const savedNestedCategory = await newNestedCategory.save()
    return { newId: savedNestedCategory._id, message: 'Success' }
  }

  private async deleteCategory(data: any) {
    if (!data.id) {
      return { message: 'Chýba ID kategórie na odstránenie', status: 400 }
    }

    const deleteCategory = await Category.findById(data.id)
    if (!deleteCategory) {
      return { message: 'Kategória nenájdená', status: 404 }
    }

    const deleteCategoryAndChildren = async (id: mongoose.Types.ObjectId): Promise<void> => {
      const children = await Category.find({ parent_id: id })

      for (const child of children) {
        await deleteCategoryAndChildren(child._id)
      }

      await Category.findByIdAndDelete(id)
    }

    await deleteCategoryAndChildren(deleteCategory._id)

    await Category.updateMany(
      { parent_id: deleteCategory.parent_id, order: { $gt: deleteCategory.order } },
      { $inc: { order: -1 } }
    )

    return { message: 'Success' }
  }

  private async moveCategoryUp(data: any) {
    if (!data.id) {
      return { message: 'Chýba ID kategórie na presunutie hore', status: 400 }
    }

    const categoryUp = await Category.findById(data.id)
    if (!categoryUp) {
      return { message: 'Kategória nenájdená', status: 404 }
    }

    if (categoryUp.order === 1) {
      return { message: 'Kategória je už na vrchole zoznamu', status: 400 }
    }

    const previousCategory = await Category.findOne({
      parent_id: categoryUp.parent_id,
      order: categoryUp.order - 1,
    })

    if (!previousCategory) {
      return { message: 'Predchádzajúca kategória nenájdená', status: 404 }
    }

    categoryUp.order -= 1
    previousCategory.order += 1

    await categoryUp.save()
    await previousCategory.save()

    return { message: 'Success' }
  }

  private async moveCategoryDown(data: any) {
    if (!data.id) {
      return { message: 'Chýba ID kategórie na presunutie dole', status: 400 }
    }

    const categoryDown = await Category.findById(data.id)
    if (!categoryDown) {
      return { message: 'Kategória nenájdená', status: 404 }
    }

    const maxOrder = await Category.find({ parent_id: categoryDown.parent_id })
      .sort({ order: -1 })
      .limit(1)
      .select('order')

    if (maxOrder.length === 0) {
      return { message: 'Neexistujú kategórie na presunutie dole', status: 400 }
    }

    if (categoryDown.order === maxOrder[0].order) {
      return { message: 'Kategória je už na konci zoznamu', status: 400 }
    }

    const nextCategory = await Category.findOne({
      parent_id: categoryDown.parent_id,
      order: categoryDown.order + 1,
    })

    if (!nextCategory) {
      return { message: 'Nasledujúca kategória nenájdená', status: 404 }
    }

    categoryDown.order += 1
    nextCategory.order -= 1

    await categoryDown.save()
    await nextCategory.save()

    return { message: 'Success' }
  }
}

export default new ApiCategoryController()
