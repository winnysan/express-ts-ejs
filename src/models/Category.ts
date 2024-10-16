import mongoose from 'mongoose'

export interface ICategory extends mongoose.Document {
  _id: mongoose.Types.ObjectId
  name: string
  parent_id: mongoose.Schema.Types.ObjectId
}

const categorySchema = new mongoose.Schema<ICategory>({
  name: { type: String, required: true },
  parent_id: { type: mongoose.Schema.Types.ObjectId, default: null },
})

const Category = mongoose.model<ICategory>('Category', categorySchema)

export default Category
