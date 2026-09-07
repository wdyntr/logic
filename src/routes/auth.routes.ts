import { Router } from "express";
import { register, login, me } from "../controllers/auth.controller";
import { registerSchema, loginSchema } from "../validators/auth.validator";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";

const router = Router();
router.post("/register", idempotency, validate(registerSchema), register);
router.post("/login", idempotency, validate(loginSchema), login);
router.get("/me", authenticate, me);

export default router;
