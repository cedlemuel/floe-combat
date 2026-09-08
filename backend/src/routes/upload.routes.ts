import { Router } from "express";

import {
  cleanupUploadsController,
  createUploadSignatureController,
} from "../controller/upload.controller.js";

import authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

router.post("/signature", authMiddleware, createUploadSignatureController);

router.post("/cleanup", authMiddleware, cleanupUploadsController);

export default router;
