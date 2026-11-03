import { Router } from "express";
import {
  register,
  login,
  me,
  update,
  refresh,
  logout,
  getCsrfToken,
} from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";
import { doubleCsrfProtection } from "../middleware/csrf.middleware";
import { asyncHandler } from "../utils/async-handler";
import {
  loginSchema,
  registerSchema,
  updateSchema,
} from "../validators/auth.validator";
import { validate } from "../middleware/validate.middleware";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.get("/me", authenticate, asyncHandler(me));
router.get("/csrf-token", authenticate, asyncHandler(getCsrfToken));
router.patch(
  "/me",
  authenticate,
  doubleCsrfProtection,
  validate(updateSchema),
  asyncHandler(update),
);
router.post("/refresh", asyncHandler(refresh));
router.post(
  "/logout",
  authenticate,
  doubleCsrfProtection,
  asyncHandler(logout),
);

export default router;
