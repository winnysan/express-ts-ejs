import mongoose from 'mongoose'

export interface ICategory extends mongoose.Document {
  _id: mongoose.Types.ObjectId
  name: string
  parent_id: mongoose.Schema.Types.ObjectId
  order: number
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, default: null },
  order: { type: Number, default: 1 },
})

const Category = mongoose.model<ICategory>('Category', categorySchema)

export default Category
