import cloudinary from "../config/cloudinary.js";
import { deleteProductImage } from "../service/cloudinary.service.js";
import type { NewProductImage } from "../types/product.js";

const parseSizes = (sizes: unknown): string[] | null => {
  if (
    !Array.isArray(sizes) ||
    sizes.length === 0 ||
    !sizes.every((size) => typeof size === "string" && size.trim().length > 0)
  ) {
    return null;
  }

  return sizes.map((size) => size.trim());
};

const parseDeletedImageIds = (value: unknown): number[] | null => {
  if (value === undefined) {
    return [];
  }

  if (
    !Array.isArray(value) ||
    !value.every((id) => Number.isSafeInteger(id) && id > 0)
  ) {
    return null;
  }

  return [...new Set(value)];
};

const parseProductImages = (value: unknown): NewProductImage[] | null => {
  if (!Array.isArray(value)) {
    return null;
  }

  const images: NewProductImage[] = [];

  for (const item of value) {
    if (typeof item !== "object" || item === null) {
      return null;
    }

    const image = item as Record<string, unknown>;

    if (
      typeof image.image_url !== "string" ||
      !image.image_url.trim() ||
      typeof image.image_public_id !== "string" ||
      !image.image_public_id.trim()
    ) {
      return null;
    }

    if (!image.image_public_id.startsWith("floe-combat/products/")) {
      return null;
    }

    images.push({
      image_url: image.image_url.trim(),
      image_public_id: image.image_public_id.trim(),
    });
  }

  return images;
};

const getHighlightVideoThumbnail = (publicId: string): string => {
  return cloudinary.url(publicId, {
    resource_type: "video",
    format: "jpg",
    transformation: [
      {
        start_offset: "0.1",
      },
    ],
  });
};

export {
  parseSizes,
  parseDeletedImageIds,
  parseProductImages,
  getHighlightVideoThumbnail,
};
