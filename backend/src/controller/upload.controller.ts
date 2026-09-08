import type { Request, Response } from "express";
import { v2 as cloudinary } from "cloudinary";
import type { CleanupAsset, UploadPurpose } from "../types/upload.js";
import { isCloudinaryAssetReferenced } from "../service/upload.service.js";
import { deleteCloudinaryAsset } from "../service/cloudinary.service.js";

const uploadConfigs: Record<
  UploadPurpose,
  {
    folder: string;
    resourceType: "image" | "video";
    allowedFormats: string[];
  }
> = {
  "product-image": {
    folder: "floe-combat/products",
    resourceType: "image",
    allowedFormats: ["jpg", "jpeg", "png"],
  },

  "highlight-image": {
    folder: "floe-combat/highlights",
    resourceType: "image",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  },

  "highlight-video": {
    folder: "floe-combat/highlights",
    resourceType: "video",
    allowedFormats: ["mp4", "webm", "mov"],
  },

  "highlight-thumbnail": {
    folder: "floe-combat/highlights/thumbnails",
    resourceType: "image",
    allowedFormats: ["jpg", "jpeg", "png", "webp"],
  },
};

const createUploadSignatureController = (req: Request, res: Response) => {
  const { purpose } = req.body as {
    purpose?: string;
  };

  if (!purpose || !(purpose in uploadConfigs)) {
    res.status(400).json({
      success: false,
      message: "Invalid upload purpose.",
    });

    return;
  }

  const config = uploadConfigs[purpose as UploadPurpose];

  const timestamp = Math.round(Date.now() / 1000);

  const uploadParams = {
    timestamp,
    folder: config.folder,
    allowed_formats: config.allowedFormats.join(","),
  };

  const signature = cloudinary.utils.api_sign_request(
    uploadParams,
    process.env.CLOUDINARY_API_SECRET!,
  );

  res.status(200).json({
    success: true,
    result: {
      timestamp,
      signature,
      folder: config.folder,
      resourceType: config.resourceType,
      allowedFormats: config.allowedFormats,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
    },
  });
};

const isAllowedCleanupAsset = (
  publicId: string,
  resourceType: "image" | "video",
): boolean => {
  if (publicId.startsWith("floe-combat/highlights/thumbnails/")) {
    return resourceType === "image";
  }

  if (publicId.startsWith("floe-combat/highlights/")) {
    return resourceType === "image" || resourceType === "video";
  }

  if (publicId.startsWith("floe-combat/products/")) {
    return resourceType === "image";
  }

  return false;
};

const cleanupUploadsController = async (req: Request, res: Response) => {
  const { assets } = req.body as {
    assets?: unknown;
  };

  if (!Array.isArray(assets) || assets.length === 0 || assets.length > 20) {
    res.status(400).json({
      success: false,
      message: "Assets must be an array containing 1 to 20 items.",
    });

    return;
  }

  const parsedAssets: CleanupAsset[] = [];

  for (const item of assets) {
    if (typeof item !== "object" || item === null) {
      res.status(400).json({
        success: false,
        message: "Invalid cleanup asset.",
      });

      return;
    }

    const asset = item as Record<string, unknown>;

    if (
      typeof asset.publicId !== "string" ||
      !asset.publicId.trim() ||
      (asset.resourceType !== "image" && asset.resourceType !== "video")
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid cleanup asset.",
      });

      return;
    }

    const publicId = asset.publicId.trim();
    const resourceType = asset.resourceType;

    if (!isAllowedCleanupAsset(publicId, resourceType)) {
      res.status(400).json({
        success: false,
        message: "Asset is outside an allowed upload folder.",
      });

      return;
    }

    parsedAssets.push({
      publicId,
      resourceType,
    });
  }

  const deleted: string[] = [];
  const skipped: string[] = [];
  const failed: string[] = [];

  for (const asset of parsedAssets) {
    try {
      const isReferenced = await isCloudinaryAssetReferenced(asset.publicId);

      if (isReferenced) {
        skipped.push(asset.publicId);
        continue;
      }

      const result = await deleteCloudinaryAsset(
        asset.publicId,
        asset.resourceType,
      );

      if (result.result === "ok" || result.result === "not found") {
        deleted.push(asset.publicId);
      } else {
        failed.push(asset.publicId);
      }
    } catch (error) {
      console.error(`Failed to cleanup ${asset.publicId}:`, error);

      failed.push(asset.publicId);
    }
  }

  res.status(200).json({
    success: failed.length === 0,
    message:
      failed.length === 0
        ? "Upload cleanup completed."
        : "Upload cleanup completed with some failures.",
    result: {
      deleted,
      skipped,
      failed,
    },
  });
};

export { createUploadSignatureController, cleanupUploadsController };
