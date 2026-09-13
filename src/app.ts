import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path'
import authRoutes from './routes/auth.routes'
import todoRoutes from './routes/todo.routes'
import { Request, Response, NextFunction } from "express";
import { authPage, homepage, todoPage } from './controllers/public.controller'

const app = express()

app.use(
  cors({
    origin: [
      "http://localhost:3001",
      "http://127.0.0.1:3001",
      "http://0.0.0.0:3001",
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

app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)


app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (process.env.NODE_ENV === "local") {
    res.status(500).json({
      message: "Terjadi kesalahan pada server",
      stack: err.stack,
      errMessage: err.message,
    });
  } else {
    res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
});

export default app
