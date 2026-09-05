import express from 'express'

import { Request, Response, NextFunction } from 'express'
import path from "path";
import cookieParser from "cookie-parser";
import { homepage, authPage } from './controllers/public.controller';
import authRoutes from './routes/auth.routes'

const app = express()
const PORT = 3001

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", homepage);
app.get("/auth", authPage);
app.use("/api", authRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error("[error]", err.stack || err.message);
  res.status(500).json({ message: "Terjadi kesalahan pada server" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});