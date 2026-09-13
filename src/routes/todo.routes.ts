import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";
import { destroy, index, store, toggle, update } from "../controllers/todo.controller";
import { validate, validateParams } from "../middleware/validate.middleware";
import { createTodoSchema, updateTodoSchema, todoIdParamSchema } from "../validators/todo.validator";
import { apiLimiter } from "../middleware/rateLimit.middleware";

const router = Router();

router.use(authenticate, apiLimiter);

router.get("/", index);
router.post("/", validate(createTodoSchema), idempotency, store);
router.patch("/:id", validate(updateTodoSchema), idempotency, update);
router.patch("/:id/toggle", validateParams(todoIdParamSchema), idempotency, toggle);
router.delete("/:id", validateParams(todoIdParamSchema), destroy);

export default router;
