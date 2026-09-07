import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import { uploadProductImage } from "../service/cloudinary.service.js";

const uploadImageController = async (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({
      message: "Please send an image using the field name 'image'.",
    });
  }

  try {
    const uploadedImage = await uploadProductImage(req.file.buffer);

    return res.status(201).json({
      message: "Image uploaded successfully.",
      imageUrl: uploadedImage.imageUrl,
      publicId: uploadedImage.publicId,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Image upload failed.",
    });
  }
};

const createUploadSignatureController = (req: Request, res: Response) => {
  const { purpose } = req.body;

  const folders: Record<string, string> = {
    "highlight-media": "floe-combat/highlights",
    "highlight-thumbnail": "floe-combat/highlights/thumbnails",
    "product-image": "floe-combat/products",
  };

  const folder = folders[purpose];

  if (!folder) {
    return res.status(400).json({
      success: false,
      message: "Invalid upload purpose.",
    });
  }

  const timestamp = Math.round(Date.now() / 1000);

  const signature = cloudinary.utils.api_sign_request(
    {
      timestamp,
      folder,
    },
    process.env.CLOUDINARY_API_SECRET!,
  );

  return res.status(200).json({
    success: true,
    result: {
      timestamp,
      signature,
      folder,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    },
  });
};

export { createUploadSignatureController, uploadImageController };
