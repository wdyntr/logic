import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import {env} from './config/env'
import { homepage, authPage } from './controllers/public.controller'

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

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))


export default app
