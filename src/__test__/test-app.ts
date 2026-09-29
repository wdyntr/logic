import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "../routes/auth.routes";
import todoRoutes from "../routes/todo.routes";
import { errorHandler, notFoundHandler } from "../middleware/error.middleware";

const app = express();

app.use(cookieParser())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/todos', todoRoutes)

app.use('/api', notFoundHandler)
app.use(errorHandler);

export default app