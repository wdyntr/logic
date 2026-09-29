import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import authRoutes from './routes/auth.routes'
import todoRoutes from './routes/todo.routes'
import dsaRoutes from './routes/dsa.routes'
import { authPage, dsaPAge, homepage, todoPage } from './controllers/public.controller'
import { env } from './config/env'
import { notFoundHandler, errorHandler } from './middleware/error.middleware'

const app = express()
const PORT = env.PORT

app.use(
  cors({
    origin: [
      `http://localhost:${PORT}`,
      `http://127.0.0.1:${PORT}`,
      `http://0.0.0.0:${PORT}`,
    ],
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-csrf-token",
      "Idempotency-key",
    ],
  })
);


app.use(express.json())
app.use(cookieParser())
app.use(express.static(path.join(__dirname, './public')))

app.get('/', homepage)
app.get('/auth', authPage)
app.get('/todo', todoPage)
app.get('/dsa', dsaPAge)

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)
app.use('/api/dsa', dsaRoutes)

app.use('/api', notFoundHandler)
app.use((req, res) => res.status(404).render('404'))
app.use(errorHandler);

export default app
