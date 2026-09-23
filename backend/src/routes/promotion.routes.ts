import { Router } from "express";

import {
  createPromoSlideController,
  deletePromoSlideController,
  getAdminPromoSlidesController,
  getPromoSlideController,
  getPromoSlidesController,
  updatePromoSlideController,
} from "../controller/promotion.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getPromoSlidesController);

router.get("/admin", authMiddleware, getAdminPromoSlidesController);

router.get("/:id", getPromoSlideController);

router.post("/", authMiddleware, createPromoSlideController);

router.put("/:id", authMiddleware, updatePromoSlideController);

router.delete("/:id", authMiddleware, deletePromoSlideController);

export default router;
