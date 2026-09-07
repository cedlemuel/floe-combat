import { Router } from "express";
import {
  loginAdminController,
  getAdminActivitiesController,
  logoutAdminController,
} from "../controller/admin.controller.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { adminLoginRateLimiter } from "../middleware/rateLimit.middleware.js";

const router = Router();

router.post("/login", adminLoginRateLimiter, loginAdminController);
router.post("/logout", logoutAdminController);
router.get("/", authMiddleware, getAdminActivitiesController);
router.get("/me", authMiddleware, (req, res) => {
  return res.status(200).json({
    success: true,
    result: req.admin,
  });
});

export default router;
