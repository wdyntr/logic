import { Router } from "express";
import { asyncHandler } from "../utils/async-handler";
import { display } from "../controllers/dsa.controller";

const router = Router();

router.post("/", asyncHandler(display));


export default router;