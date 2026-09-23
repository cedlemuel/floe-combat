import type {
  CreatePromoSlideInput,
  PromoSlide,
  PromoSlideResponse,
  PromoSlidesResponse,
  UpdatePromoSlideInput,
} from "../types/types";

const API_URL = import.meta.env.VITE_API_URL;

const getPromoSlides = async (): Promise<PromoSlide[]> => {
  const response = await fetch(`${API_URL}/promotions`);

  const data: PromoSlidesResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch promo slides.");
  }

  return data.result;
};

const getAdminPromoSlides = async (): Promise<PromoSlide[]> => {
  const response = await fetch(`${API_URL}/promotions/admin`, {
    credentials: "include",
  });

  const data: PromoSlidesResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Failed to fetch promo slides.");
  }

  return data.result;
};

const createPromoSlide = async (
  promoSlide: CreatePromoSlideInput,
): Promise<PromoSlide> => {
  const response = await fetch(`${API_URL}/promotions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(promoSlide),
  });

  const data: PromoSlideResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Could not create promo slide.");
  }

  return data.result;
};

const updatePromoSlide = async (
  id: number,
  promoSlide: UpdatePromoSlideInput,
): Promise<PromoSlide> => {
  const response = await fetch(`${API_URL}/promotions/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(promoSlide),
  });

  const data: PromoSlideResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Could not update promo slide.");
  }

  return data.result;
};

const deletePromoSlide = async (id: number): Promise<PromoSlide> => {
  const response = await fetch(`${API_URL}/promotions/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const data: PromoSlideResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Could not delete promo slide.");
  }

  return data.result;
};

export {
  getPromoSlides,
  getAdminPromoSlides,
  createPromoSlide,
  updatePromoSlide,
  deletePromoSlide,
};
