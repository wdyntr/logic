import { Route } from "express";
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

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", me);
router.get("/csrf-token", getCsrfToken);
router.patch("/me", update);
router.post("/refresh", refresh);
router.post("/logout", logout);

export default router;
