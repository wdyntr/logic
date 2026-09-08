import express from "express";
import cors from "cors";
import { Request, Response, NextFunction } from "express";
import path from "path";
import cookieParser from "cookie-parser";
import { homepage, authPage, todoPage } from "./controllers/public.controller";
import authRoutes from "./routes/auth.routes";
import todoRoutes from "./routes/todo.routes";
import { cleanUpIdempotencyKeys } from "./jobs/cleanup-idempotency";

const app = express();
const PORT = 3001;
const allowOrigins = [
  "http://localhost:3001",
  "http://127.0.0.1:3001",
  "http://0.0.0.0:3001",
];

app.use(
  cors({
    origin: allowOrigins,
    credentials: true,
    methods: ["GET", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-csrf-token",
      "Idempotency-key",
    ],
  }),
);

app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "./public")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.get("/", homepage);
app.get("/auth", authPage);
app.get("/todo", todoPage);
app.use("/api/auth", authRoutes);
app.use("/api/todos", todoRoutes);

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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  cleanUpIdempotencyKeys().catch(console.error);
});

setInterval(
  () => {
    cleanUpIdempotencyKeys().catch(console.error);
  },
  60 * 60 * 1000,
);
