import type { Request, Response } from "express";

import {
  createCustomerReview,
  createAdminReview,
  getApprovedReviews,
  getAllReviews,
  getReviewById,
  updateReviewStatus,
  updateReviewFeatured,
  updateReview,
  deleteReviewById,
} from "../service/review.service.js";
import { createAdminActivity } from "../service/adminActivity.service.js";
import { getProductById } from "../service/product.service.js";

const createCustomerReviewController = async (req: Request, res: Response) => {
  const { author, role, productId, rating, reviewText } = (req.body ??
    {}) as Record<string, unknown>;

  const parsedProductId = Number(productId);
  const parsedRating = Number(rating);

  if (
    typeof author !== "string" ||
    typeof role !== "string" ||
    typeof reviewText !== "string" ||
    !author.trim() ||
    !role.trim() ||
    !reviewText.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Author, role, and review are required.",
    });
    return;
  }

  if (!Number.isSafeInteger(parsedProductId) || parsedProductId <= 0) {
    res.status(400).json({
      success: false,
      message: "A valid product is required.",
    });
    return;
  }

  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5.",
    });
    return;
  }

  try {
    const review = await createCustomerReview({
      author: author.trim(),
      role: role.trim(),
      productId: parsedProductId,
      rating: parsedRating,
      reviewText: reviewText.trim(),
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: "Review submitted successfully and is awaiting approval.",
      result: review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not submit review.",
    });
  }
};

const getApprovedReviewsController = async (_req: Request, res: Response) => {
  try {
    const reviews = await getApprovedReviews();

    res.status(200).json({
      success: true,
      message: "Approved reviews fetched successfully.",
      result: reviews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch approved reviews.",
    });
  }
};

const getAllReviewsController = async (_req: Request, res: Response) => {
  try {
    const reviews = await getAllReviews();

    res.status(200).json({
      success: true,
      message: "Reviews fetched successfully.",
      result: reviews,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch reviews.",
    });
  }
};

const getReviewByIdController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Review ID must be a positive integer.",
    });
    return;
  }

  try {
    const review = await getReviewById(id);

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Review fetched successfully.",
      result: review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not fetch review.",
    });
  }
};

const createAdminReviewController = async (req: Request, res: Response) => {
  const { author, role, productId, rating, reviewText, featured } = (req.body ??
    {}) as Record<string, unknown>;

  const parsedProductId = Number(productId);
  const parsedRating = Number(rating);

  if (
    typeof author !== "string" ||
    typeof role !== "string" ||
    typeof reviewText !== "string" ||
    !author.trim() ||
    !role.trim() ||
    !reviewText.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Author, role, and review are required.",
    });

    return;
  }

  if (!Number.isSafeInteger(parsedProductId) || parsedProductId <= 0) {
    res.status(400).json({
      success: false,
      message: "A valid product is required.",
    });

    return;
  }

  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5.",
    });

    return;
  }

  if (typeof featured !== "boolean") {
    res.status(400).json({
      success: false,
      message: "Featured must be true or false.",
    });

    return;
  }

  try {
    const review = await createAdminReview({
      author: author.trim(),
      role: role.trim(),
      productId: parsedProductId,
      rating: parsedRating,
      reviewText: reviewText.trim(),
      featured,
    });

    if (!review) {
      res.status(404).json({
        success: false,
        message: "Product not found.",
      });

      return;
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "CREATE_REVIEW",
        "review",
        review.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(201).json({
      success: true,
      message: "Review created successfully.",
      result: review,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not create review.",
    });
  }
};

const updateReviewStatusController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status } = (req.body ?? {}) as Record<string, unknown>;

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Review ID must be a positive integer.",
    });

    return;
  }

  if (status !== "approved" && status !== "rejected") {
    res.status(400).json({
      success: false,
      message: "Status must be approved or rejected.",
    });

    return;
  }

  try {
    const updatedReview = await updateReviewStatus(id, {
      status,
    });

    if (!updatedReview) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "Review approved successfully."
          : "Review rejected successfully.",
      result: updatedReview,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not update review status.",
    });
  }
};

const updateReviewFeaturedController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { featured } = (req.body ?? {}) as Record<string, unknown>;

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Review ID must be a positive integer.",
    });
    return;
  }

  if (typeof featured !== "boolean") {
    res.status(400).json({
      success: false,
      message: "Featured must be true or false.",
    });
    return;
  }

  try {
    const existingReview = await getReviewById(id);

    if (!existingReview) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });
      return;
    }

    if (featured && existingReview.status !== "approved") {
      res.status(400).json({
        success: false,
        message: "Only approved reviews can be featured.",
      });
      return;
    }

    const updatedReview = await updateReviewFeatured(id, featured);

    if (!updatedReview) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });
      return;
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        featured ? "FEATURE_REVIEW" : "UNFEATURE_REVIEW",
        "review",
        updatedReview.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(200).json({
      success: true,
      message: featured
        ? "Review featured successfully."
        : "Review unfeatured successfully.",
      result: updatedReview,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not update featured status.",
    });
  }
};

const updateReviewController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  const { author, role, productId, rating, reviewText } = (req.body ??
    {}) as Record<string, unknown>;

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Review ID must be a positive integer.",
    });
    return;
  }

  const parsedRating = Number(rating);

  if (
    typeof author !== "string" ||
    typeof role !== "string" ||
    typeof reviewText !== "string" ||
    !author.trim() ||
    !role.trim() ||
    !reviewText.trim()
  ) {
    res.status(400).json({
      success: false,
      message: "Author, role, and review are required.",
    });
    return;
  }

  if (!Number.isInteger(parsedRating) || parsedRating < 1 || parsedRating > 5) {
    res.status(400).json({
      success: false,
      message: "Rating must be between 1 and 5.",
    });
    return;
  }

  try {
    const existingReview = await getReviewById(id);

    if (!existingReview) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });
      return;
    }

    let finalProductId = existingReview.product_id;
    let finalProductName = existingReview.product_name;

    if (productId !== undefined && productId !== null && productId !== "") {
      const parsedProductId = Number(productId);

      if (!Number.isSafeInteger(parsedProductId) || parsedProductId <= 0) {
        res.status(400).json({
          success: false,
          message: "A valid product is required.",
        });
        return;
      }

      const product = await getProductById(parsedProductId);

      if (!product) {
        res.status(404).json({
          success: false,
          message: "Product not found.",
        });
        return;
      }

      finalProductId = product.id;
      finalProductName = product.title;
    }

    const updatedReview = await updateReview(id, {
      author: author.trim(),
      role: role.trim(),
      productId: finalProductId,
      productName: finalProductName,
      rating: parsedRating,
      reviewText: reviewText.trim(),
    });

    if (!updatedReview) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });
      return;
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "UPDATE_REVIEW",
        "review",
        updatedReview.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      result: updatedReview,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not update review.",
    });
  }
};

const deleteReviewController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    res.status(400).json({
      success: false,
      message: "Review ID must be a positive integer.",
    });

    return;
  }

  try {
    const deletedReview = await deleteReviewById(id);

    if (!deletedReview) {
      res.status(404).json({
        success: false,
        message: "Review not found.",
      });

      return;
    }

    try {
      await createAdminActivity(
        req.admin!.adminId,
        "DELETE_REVIEW",
        "review",
        deletedReview.id,
      );
    } catch (activityError) {
      console.error("Failed to create admin activity:", activityError);
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
      result: deletedReview,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Could not delete review.",
    });
  }
};

export {
  createCustomerReviewController,
  createAdminReviewController,
  getApprovedReviewsController,
  getAllReviewsController,
  getReviewByIdController,
  updateReviewStatusController,
  updateReviewFeaturedController,
  updateReviewController,
  deleteReviewController,
};
