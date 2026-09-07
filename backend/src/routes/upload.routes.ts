import { Router } from "express";
import { uploadImage } from "../middleware/upload.middleware.js";
import authMiddleware from "../middleware/auth.middleware.js";
import { createUploadSignatureController, uploadImageController } from "../controller/upload.controller.js";

const router = Router();

router.post(
  "/images",
  authMiddleware,
  uploadImage.single("image"),
  uploadImageController,
);

router.post("/signature", authMiddleware, createUploadSignatureController);

export default router;
