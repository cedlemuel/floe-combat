import { Router } from "express";

import {
  createProductController,
  deleteProductController,
  getProductsController,
  updateProductController,
} from "../controller/product.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", getProductsController);

router.post("/", authMiddleware, createProductController);

router.patch("/:id", authMiddleware, updateProductController);

router.delete("/:id", authMiddleware, deleteProductController);

export default router;
