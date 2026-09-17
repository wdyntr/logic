import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { display, displayDB } from "../controllers/dsa.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", asyncHandler(display));
router.get("/", authenticate, asyncHandler(displayDB));


export default router;