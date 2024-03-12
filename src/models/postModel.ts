import mongoose from 'mongoose'

export interface IPost extends mongoose.Document {
  author: mongoose.Types.ObjectId
  title: string
  body: string
  slug: string
  createdAt: Date
  updatedAt: Date
}

const postSchema = new mongoose.Schema<IPost>(
  {
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: { type: String, required: true },
    body: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
  },
  { timestamps: true }
)

const Post = mongoose.model<IPost>('Post', postSchema)

export default Post
