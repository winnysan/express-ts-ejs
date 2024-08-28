import multer from 'multer'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/'))
  },
  filename: (req, file, cb) => {
    const uuidName = `${uuidv4()}${path.extname(file.originalname)}`
    cb(null, uuidName)
  },
})

const upload = multer({ storage })

export default upload
