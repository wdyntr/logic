import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { dequeue, display, displayDB, enqueue, peek } from "../controllers/dsa.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.post("/", asyncHandler(display));
router.get("/", authenticate, asyncHandler(displayDB));
router.post("/queue", asyncHandler(enqueue));
router.post("/dequeue", asyncHandler(dequeue));
router.get("/peek", asyncHandler(peek));


export default router;