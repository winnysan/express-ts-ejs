import express from 'express'
import mongoose from 'mongoose'
import Category from '../models/Category'

class ApiRouter {
  public router: express.Router

  constructor() {
    this.router = express.Router()
    this.setRoutes()
  }

  private setRoutes(): void {
    this.router.get('/csrf-token', (req: express.Request, res: express.Response) => {
      const csrfToken = req.csrfToken?.()

      if (csrfToken) {
        res.json({ csrfToken })
      } else {
        res.status(500).json({ message: 'CSRF token not available' })
      }
    })

    this.router.post('/hello', (req: express.Request, res: express.Response): void => {
      const { data } = req.body

      if (typeof data === 'string') {
        res.status(200).json({ message: 'Data has been received', data })
      } else {
        res.status(400).json({ message: 'Invalid format, must be a string' })
      }
    })

    this.router.post('/categories', async (req: express.Request, res: express.Response) => {
      try {
        const { data } = req.body

        if (!data || !data.action) {
          return res.status(400).json({ message: 'Neplatné dáta' })
        }

        const action = data.action

        switch (action) {
          case 'input':
            // Upravenie názvu kategórie
            if (!data.id || typeof data.value !== 'string') {
              return res.status(400).json({ message: 'Neplatné dáta pre úpravu' })
            }

            const updatedCategory = await Category.findByIdAndUpdate(data.id, { name: data.value }, { new: true })

            if (!updatedCategory) {
              return res.status(404).json({ message: 'Kategória nenájdená' })
            }

            break

          case 'addFirst':
            // Pridanie prvej kategórie
            const topCategories = await Category.find({ parent_id: null }).sort({ order: -1 }).limit(1)
            const nextOrderFirst = topCategories.length > 0 ? topCategories[0].order + 1 : 1

            const newFirstCategory = new Category({
              name: 'Untitled', // Predvolený názov, frontend ho môže upraviť cez 'input' akciu
              parent_id: null,
              order: nextOrderFirst,
            })

            const savedFirstCategory = await newFirstCategory.save()

            data.newId = savedFirstCategory._id

            break

          case 'add':
            // Pridanie novej kategórie za existujúcou
            if (!data.after) {
              return res.status(400).json({ message: 'Chýba ID kategórie, za ktorou sa pridáva nová' })
            }

            const afterCategory = await Category.findById(data.after)

            if (!afterCategory) {
              return res.status(404).json({ message: 'Kategória, za ktorou sa pridáva, nenájdená' })
            }

            const parentId = afterCategory.parent_id
            const nextOrderAdd = afterCategory.order + 1

            // Zvýšenie poradia ostatných kategórií
            await Category.updateMany({ parent_id: parentId, order: { $gte: nextOrderAdd } }, { $inc: { order: 1 } })

            const newCategory = new Category({
              name: 'Untitled', // Predvolený názov
              parent_id: parentId,
              order: nextOrderAdd,
            })

            const savedCategory = await newCategory.save()

            data.newId = savedCategory._id

            break

          case 'addNested':
            // Pridanie vnorené kategórie
            if (!data.nested) {
              return res.status(400).json({ message: 'Chýba ID nadradenej kategórie' })
            }

            const parentCategory = await Category.findById(data.nested)

            if (!parentCategory) {
              return res.status(404).json({ message: 'Nadradená kategória nenájdená' })
            }

            const childCategories = await Category.find({ parent_id: parentCategory._id }).sort({ order: -1 }).limit(1)
            const nextOrderNested = childCategories.length > 0 ? childCategories[0].order + 1 : 1

            const newNestedCategory = new Category({
              name: 'Untitled', // Predvolený názov
              parent_id: parentCategory._id,
              order: nextOrderNested,
            })

            const savedNestedCategory = await newNestedCategory.save()

            data.newId = savedNestedCategory._id

            break

          case 'delete':
            // Odstránenie kategórie a všetkých jej podkategórií
            if (!data.id) {
              return res.status(400).json({ message: 'Chýba ID kategórie na odstránenie' })
            }

            const deleteCategory = await Category.findById(data.id)

            if (!deleteCategory) {
              return res.status(404).json({ message: 'Kategória na odstránenie nenájdená' })
            }

            // Definujeme funkciu ako function expression (arrow function)
            const deleteCategoryAndChildren = async (id: mongoose.Types.ObjectId): Promise<void> => {
              const children = await Category.find({ parent_id: id })

              for (const child of children) {
                await deleteCategoryAndChildren(child._id)
              }

              await Category.findByIdAndDelete(id)
            }

            await deleteCategoryAndChildren(deleteCategory._id)

            // Aktualizácia poradia ostatných kategórií
            await Category.updateMany(
              { parent_id: deleteCategory.parent_id, order: { $gt: deleteCategory.order } },
              { $inc: { order: -1 } }
            )

            break

          case 'up':
            // Presunutie kategórie hore
            if (!data.id) {
              return res.status(400).json({ message: 'Chýba ID kategórie na presunutie hore' })
            }

            const categoryUp = await Category.findById(data.id)

            if (!categoryUp) {
              return res.status(404).json({ message: 'Kategória na presunutie hore nenájdená' })
            }

            if (categoryUp.order === 1) {
              // Kategória je už na prvom mieste
              return res.status(400).json({ message: 'Kategória je už na vrchole zoznamu' })
            }

            const previousCategory = await Category.findOne({
              parent_id: categoryUp.parent_id,
              order: categoryUp.order - 1,
            })

            if (!previousCategory) {
              return res.status(404).json({ message: 'Predchádzajúca kategória nenájdená' })
            }

            // Prehoďme poradie
            categoryUp.order -= 1
            previousCategory.order += 1

            await categoryUp.save()
            await previousCategory.save()

            break

          case 'down':
            // Presunutie kategórie dole
            if (!data.id) {
              return res.status(400).json({ message: 'Chýba ID kategórie na presunutie dole' })
            }

            const categoryDown = await Category.findById(data.id)

            if (!categoryDown) {
              return res.status(404).json({ message: 'Kategória na presunutie dole nenájdená' })
            }

            const maxOrder = await Category.find({ parent_id: categoryDown.parent_id })
              .sort({ order: -1 })
              .limit(1)
              .select('order')

            if (maxOrder.length === 0) {
              return res.status(400).json({ message: 'Neexistujú kategórie na presunutie dole' })
            }

            if (categoryDown.order === maxOrder[0].order) {
              // Kategória je už na poslednom mieste
              return res.status(400).json({ message: 'Kategória je už na konci zoznamu' })
            }

            const nextCategory = await Category.findOne({
              parent_id: categoryDown.parent_id,
              order: categoryDown.order + 1,
            })

            if (!nextCategory) {
              return res.status(404).json({ message: 'Nasledujúca kategória nenájdená' })
            }

            // Prehoďme poradie
            categoryDown.order += 1
            nextCategory.order -= 1

            await categoryDown.save()
            await nextCategory.save()

            break

          default:
            res.status(400).json({ message: 'Neznáma akcia' })
            return
        }

        // Pripravíme odpoveď
        const responseData: any = { action, message: 'Success' }

        // Ak bola vytvorená nová kategória, pridáme jej _id do odpovede
        if (data.newId) {
          responseData.newId = data.newId
        }

        res.status(200).json(responseData)
      } catch (error) {
        console.error('Chyba pri spracovaní požiadavky /categories:', error)
        res.status(500).json({ message: 'Interná chyba servera' })
      }
    })
  }
}

export default new ApiRouter().router
