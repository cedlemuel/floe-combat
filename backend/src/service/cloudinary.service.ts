import cloudinary from "../config/cloudinary.js";
import type { CloudinaryError, ResourceType } from "../types/cloudinary.js";
import type { NewProductImage } from "../types/product.js";

const sleep = (ms: number) => {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
};

const shouldRetryCloudinaryError = (error: unknown): boolean => {
  if (typeof error !== "object" || error === null) {
    return false;
  }

  const cloudinaryError = error as CloudinaryError;

  const httpCode =
    cloudinaryError.http_code ?? cloudinaryError.error?.http_code;

  const name = cloudinaryError.name ?? cloudinaryError.error?.name;

  if (name === "TimeoutError") {
    return true;
  }

  if (httpCode === 408 || httpCode === 429 || httpCode === 499) {
    return true;
  }

  if (httpCode && httpCode >= 500) {
    return true;
  }

  return false;
};

const deleteWithRetry = async (
  publicId: string,
  resourceType: ResourceType,
  retries = 2,
) => {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: resourceType,
        type: "upload",
        invalidate: true,
      });

      return result;
    } catch (error) {
      const isLastAttempt = attempt === retries;

      if (isLastAttempt || !shouldRetryCloudinaryError(error)) {
        throw error;
      }

      const delay = 1000 * (attempt + 1);

      console.warn(
        `Cloudinary delete failed for ${publicId}. Retrying in ${delay}ms...`,
      );

      await sleep(delay);
    }
  }

  throw new Error(`Could not delete Cloudinary asset: ${publicId}`);
};

const deleteProductImage = async (publicId: string) => {
  return deleteWithRetry(publicId, "image");
};

const cleanupProductImages = async (images: NewProductImage[]) => {
  for (const image of images) {
    try {
      await deleteProductImage(image.image_public_id);
    } catch (error) {
      console.error(
        `Failed to cleanup Cloudinary image ${image.image_public_id}:`,
        error,
      );
    }
  }
};

const deleteHighlightMedia = async (
  publicId: string,
  mediaType: ResourceType,
) => {
  return deleteWithRetry(publicId, mediaType);
};

const deleteHighlightThumbnail = async (publicId: string) => {
  return deleteWithRetry(publicId, "image");
};

const deleteCloudinaryAsset = async (
  publicId: string,
  resourceType: ResourceType,
) => {
  return deleteWithRetry(publicId, resourceType);
};

export {
  cleanupProductImages,
  deleteCloudinaryAsset,
  deleteHighlightMedia,
  deleteHighlightThumbnail,
  deleteProductImage,
};
