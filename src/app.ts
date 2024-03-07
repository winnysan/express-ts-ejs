import dotenv from 'dotenv'
import express from 'express'
import expressLayouts from 'express-ejs-layouts'
import path from 'path'

dotenv.config()

const PORT = process.env.PORT

const app = express()

app.use(expressLayouts)
app.set('layout', 'layouts/main')
app.set('view engine', 'ejs')

app.set('views', path.join(__dirname, 'views'))

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req: express.Request, res: express.Response) => {
  res.render('index')
})

app.listen(PORT, () => {
  console.log(`Server started at http://localhost:${PORT}`)
})
