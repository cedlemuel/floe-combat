import type {
  CreateCustomerReviewInput,
  CreateReviewInput,
  Review,
  ReviewResponse,
  ReviewsResponse,
  UpdateReviewInput,
} from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

const getAdminReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_URL}/reviews/admin`, {
    credentials: "include",
  });

  const data: ReviewsResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch reviews.");
  }

  return data.result;
};

const updateReviewStatus = async (
  id: number,
  status: "approved" | "rejected",
): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews/admin/${id}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      status,
    }),
  });

  const data: ReviewResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update review status.");
  }

  return data.result;
};

const deleteReview = async (id: number): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews/admin/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data: ReviewResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to delete review.");
  }

  return data.result;
};

const createAdminReview = async (
  review: CreateReviewInput,
): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews/admin`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      author: review.author,
      role: review.role,
      productId: review.product_id,
      productName: review.product_name,
      rating: review.rating,
      reviewText: review.review_text,
      featured: review.featured,
    }),
  });

  const data: ReviewResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to create review.");
  }

  return data.result;
};

const updateAdminReview = async (
  id: number,
  review: UpdateReviewInput,
): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews/admin/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      author: review.author,
      role: review.role,
      productId: review.product_id,
      productName: review.product_name,
      rating: review.rating,
      reviewText: review.review_text,
      featured: review.featured,
    }),
  });

  const data: ReviewResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to update review.");
  }

  return data.result;
};

const getApprovedReviews = async (): Promise<Review[]> => {
  const response = await fetch(`${API_URL}/reviews/approved`);

  const data: ReviewsResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to fetch reviews.");
  }

  return data.result;
};

const createCustomerReview = async (
  review: CreateCustomerReviewInput,
): Promise<Review> => {
  const response = await fetch(`${API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      author: review.author,
      role: review.role,
      productId: review.product_id,
      productName: review.product_name,
      rating: review.rating,
      reviewText: review.review_text,
    }),
  });

  const data: ReviewResponse = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to submit review.");
  }

  return data.result;
};

const updateReviewFeatured = async (
  id: number,
  featured: boolean,
): Promise<Review> => {
  const response = await fetch(
    `${API_URL}/reviews/admin/${id}/featured`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        featured,
      }),
    },
  );

  const data: ReviewResponse = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to update featured status.",
    );
  }

  return data.result;
};

export {
  getAdminReviews,
  getApprovedReviews,
  createCustomerReview,
  createAdminReview,
  updateAdminReview,
  updateReviewStatus,
  deleteReview,
  updateReviewFeatured,
};