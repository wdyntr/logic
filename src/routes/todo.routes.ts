import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";
import { destroy, index, store, toggle, update } from "../controllers/todo.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { createTodoSchema, updateTodoSchema, todoIdParamSchema } from "../validators/todo.validator";
import { apiLimiter } from "../middleware/rateLimit.middleware";
import { asyncHandler } from "../utils/async-handler";

const router = Router();

router.use(authenticate, apiLimiter);

router.get("/", asyncHandler(index));
router.post("/", validate(createTodoSchema), idempotency, asyncHandler(store));
router.patch("/:id", validate(updateTodoSchema), idempotency, asyncHandler(update));
router.patch("/:id/toggle", validateParams(todoIdParamSchema), idempotency, asyncHandler(toggle));
router.delete("/:id", validateParams(todoIdParamSchema), asyncHandler(destroy));

export default router;
