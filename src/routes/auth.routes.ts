import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";

const router = Router();
router.post("/register", validate(registerSchema), idempotency, register);
router.post("/login", validate(loginSchema), idempotency, login);
router.get("/me", authenticate, me);

export default router;
