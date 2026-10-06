import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { getUsersV1, getUsersV2 } from "../controllers/admin.controller";

const router = Router()

router.get('/userV1', authenticate, getUsersV1)
router.get('/userV2', authenticate, getUsersV2)

export default router 