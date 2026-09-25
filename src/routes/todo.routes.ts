import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";
import { destroy, index, store, toggle, update } from "../controllers/todo.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { createTodoSchema, updateTodoSchema, todoIdParamSchema } from "../validators/todo.validator";
import { apiLimiter } from "../middleware/rateLimit.middleware";
import { asyncHandler } from "../utils/async-handler";
import { doubleCsrfProtection } from "../middleware/csrf.middleware";

const router = Router();

router.use(authenticate, apiLimiter);

router.get("/", asyncHandler(index));
router.post("/", doubleCsrfProtection, validate(createTodoSchema), idempotency, asyncHandler(store));
router.patch("/:id", doubleCsrfProtection, validate(updateTodoSchema), validateParams(todoIdParamSchema), idempotency, asyncHandler(update));
router.patch("/:id/toggle", doubleCsrfProtection, validateParams(todoIdParamSchema), idempotency, asyncHandler(toggle));
router.delete("/:id", doubleCsrfProtection, validateParams(todoIdParamSchema), idempotency, asyncHandler(destroy));

export default router;
