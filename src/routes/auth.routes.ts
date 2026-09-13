import { Router } from "express";
import { register, login, me, update, refresh, logout } from "../controllers/auth.controller";
import { registerSchema, loginSchema, updateSchema } from "../validators/auth.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), idempotency, register);
router.post("/login", authLimiter, validate(loginSchema), idempotency, login);
router.get("/me", authenticate, me);
router.patch("/me", authenticate, validate(updateSchema), update);
router.post('/refresh', authLimiter, refresh)
router.post('/logout', authenticate, logout)

export default router;