import { Router } from "express";
import { validate } from "../middleware/validate.middleware";
import { authenticate } from "../middleware/auth.middleware";
import { idempotency } from "../middleware/idempotency.middleware";
import { asyncHandler } from "../utils/async-handler";
import { display } from "../controllers/dsa.controller";

const router = Router();

router.post("/dsa", asyncHandler(display));


export default router;