import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth.routes";
import todoRoutes from "../routes/todo.routes";

const app = express();

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)

export default app