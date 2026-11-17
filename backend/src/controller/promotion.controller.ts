import type { Request, Response } from "express";

import {
  createPromoSlide,
  deletePromoSlide,
  getAdminPromoSlides,
  getPromoSlideById,
  getPromoSlides,
  updatePromoSlide,
} from "../service/promotion.service.js";

import { deleteCloudinaryAsset } from "../service/cloudinary.service.js";

import {
  isNonEmptyString,
  isPromoPublicId,
  isValidCtaLink,
} from "../utils/helper.js";

const getPromoSlidesController = async (_req: Request, res: Response) => {
  try {
    const slides = await getPromoSlides();

    res.status(200).json({
      success: true,
      message: "Promo slides fetched successfully.",
      result: slides,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch promo slides.",
    });
  }
};

const getAdminPromoSlidesController = async (_req: Request, res: Response) => {
  try {
    const slides = await getAdminPromoSlides();

    res.status(200).json({
      success: true,
      message: "Promo slides fetched successfully.",
      result: slides,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch promo slides.",
    });
  }
};

const getPromoSlideController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Promo slide ID must be a positive integer.",
    });

    return;
  }

  try {
    const slide = await getPromoSlideById(id);

    if (!slide) {
      res.status(404).json({
        success: false,
        message: "Promo slide not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Promo slide fetched successfully.",
      result: slide,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch promo slide.",
    });
  }
};

const createPromoSlideController = async (req: Request, res: Response) => {
  const {
    imageUrl,
    imagePublicId,
    eyebrow,
    title,
    subtitle,
    ctaLabel,
    ctaLink,
    sortOrder,
    isActive,
  } = (req.body ?? {}) as Record<string, unknown>;

  if (
    !isNonEmptyString(imageUrl) ||
    !isNonEmptyString(imagePublicId) ||
    !isPromoPublicId(imagePublicId) ||
    !isNonEmptyString(eyebrow) ||
    !isNonEmptyString(title) ||
    !isNonEmptyString(subtitle) ||
    !isNonEmptyString(ctaLabel) ||
    !isNonEmptyString(ctaLink) ||
    !isValidCtaLink(ctaLink)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid promo slide data.",
    });

    return;
  }

  if (
    eyebrow.trim().length > 100 ||
    title.trim().length > 255 ||
    ctaLabel.trim().length > 100 ||
    ctaLink.trim().length > 255
  ) {
    res.status(400).json({
      success: false,
      message: "One or more promo slide fields are too long.",
    });

    return;
  }

  const parsedSortOrder = sortOrder === undefined ? 0 : sortOrder;

  const parsedIsActive = isActive === undefined ? true : isActive;

  if (
    typeof parsedSortOrder !== "number" ||
    !Number.isSafeInteger(parsedSortOrder) ||
    parsedSortOrder < 0 ||
    typeof parsedIsActive !== "boolean"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid promo slide data.",
    });

    return;
  }

  try {
    const slide = await createPromoSlide({
      imageUrl: imageUrl.trim(),
      imagePublicId: imagePublicId.trim(),
      eyebrow: eyebrow.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      ctaLabel: ctaLabel.trim(),
      ctaLink: ctaLink.trim(),
      sortOrder: parsedSortOrder,
      isActive: parsedIsActive,
    });

    res.status(201).json({
      success: true,
      message: "Promo slide created successfully.",
      result: slide,
    });
  } catch (error) {
    console.error(error);

    /*
      Do not directly delete imagePublicId here.

      The frontend cleanup endpoint should handle newly uploaded,
      unreferenced Cloudinary assets safely.

      Direct deletion here could remove an image that is already
      referenced by another promo if a UNIQUE constraint error occurs.
    */

    res.status(500).json({
      success: false,
      message: "Could not create promo slide.",
    });
  }
};

const updatePromoSlideController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Promo slide ID must be a positive integer.",
    });

    return;
  }

  const {
    imageUrl,
    imagePublicId,
    eyebrow,
    title,
    subtitle,
    ctaLabel,
    ctaLink,
    sortOrder,
    isActive,
  } = (req.body ?? {}) as Record<string, unknown>;

  if (
    !isNonEmptyString(imageUrl) ||
    !isNonEmptyString(imagePublicId) ||
    !isPromoPublicId(imagePublicId) ||
    !isNonEmptyString(eyebrow) ||
    !isNonEmptyString(title) ||
    !isNonEmptyString(subtitle) ||
    !isNonEmptyString(ctaLabel) ||
    !isNonEmptyString(ctaLink) ||
    !isValidCtaLink(ctaLink) ||
    typeof sortOrder !== "number" ||
    !Number.isSafeInteger(sortOrder) ||
    sortOrder < 0 ||
    typeof isActive !== "boolean"
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid promo slide data.",
    });

    return;
  }

  if (
    eyebrow.trim().length > 100 ||
    title.trim().length > 255 ||
    ctaLabel.trim().length > 100 ||
    ctaLink.trim().length > 255
  ) {
    res.status(400).json({
      success: false,
      message: "One or more promo slide fields are too long.",
    });

    return;
  }

  try {
    const existingSlide = await getPromoSlideById(id);

    if (!existingSlide) {
      res.status(404).json({
        success: false,
        message: "Promo slide not found.",
      });

      return;
    }

    const updatedSlide = await updatePromoSlide(id, {
      imageUrl: imageUrl.trim(),
      imagePublicId: imagePublicId.trim(),
      eyebrow: eyebrow.trim(),
      title: title.trim(),
      subtitle: subtitle.trim(),
      ctaLabel: ctaLabel.trim(),
      ctaLink: ctaLink.trim(),
      sortOrder,
      isActive,
    });

    if (!updatedSlide) {
      res.status(404).json({
        success: false,
        message: "Promo slide not found.",
      });

      return;
    }

    if (existingSlide.image_public_id !== updatedSlide.image_public_id) {
      try {
        await deleteCloudinaryAsset(existingSlide.image_public_id, "image");
      } catch (cleanupError) {
        console.error("Failed to delete old promo image:", cleanupError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Promo slide updated successfully.",
      result: updatedSlide,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not update promo slide.",
    });
  }
};

const deletePromoSlideController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Promo slide ID must be a positive integer.",
    });

    return;
  }

  try {
    const deletedSlide = await deletePromoSlide(id);

    if (!deletedSlide) {
      res.status(404).json({
        success: false,
        message: "Promo slide not found.",
      });

      return;
    }

    try {
      await deleteCloudinaryAsset(deletedSlide.image_public_id, "image");
    } catch (cleanupError) {
      console.error("Failed to delete promo image:", cleanupError);
    }

    res.status(200).json({
      success: true,
      message: "Promo slide deleted successfully.",
      result: deletedSlide,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not delete promo slide.",
    });
  }
};

export {
  getPromoSlidesController,
  getAdminPromoSlidesController,
  getPromoSlideController,
  createPromoSlideController,
  updatePromoSlideController,
  deletePromoSlideController,
};
