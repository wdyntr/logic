import { Router } from "express";
import { register, login, me, update, refresh, logout, getCsrfToken } from "../controllers/auth.controller";
import { registerSchema, loginSchema, updateSchema } from "../validators/auth.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";
import { authLimiter } from "../middleware/rateLimit.middleware";
import { asyncHandler } from "../utils/async-handler";
import { doubleCsrfProtection } from "../middleware/csrf.middleware";

const router = Router();
router.post("/register", authLimiter, validate(registerSchema), idempotency, asyncHandler(register));
router.post("/login", authLimiter, validate(loginSchema), idempotency, asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));
router.get("/csrf-token", authenticate, asyncHandler(getCsrfToken));
router.patch("/me", authenticate, doubleCsrfProtection, validate(updateSchema), idempotency, asyncHandler(update));
router.post('/refresh', authLimiter, asyncHandler(refresh))
router.post('/logout', authenticate, doubleCsrfProtection, asyncHandler(logout))

export default router;