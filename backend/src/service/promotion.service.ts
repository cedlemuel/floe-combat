import pool from "../db/pool.js";

import type {
  PromoSlide,
  CreatePromoSlideInput,
  UpdatePromoSlideInput,
} from "../types/promotion.js";

const getPromoSlides = async (): Promise<PromoSlide[]> => {
  const result = await pool.query<PromoSlide>(
    `
      SELECT
        id,
        image_url,
        image_public_id,
        eyebrow,
        title,
        subtitle,
        cta_label,
        cta_link,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM promo_slides
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, id ASC
    `,
  );

  return result.rows;
};

const getAdminPromoSlides = async (): Promise<PromoSlide[]> => {
  const result = await pool.query<PromoSlide>(
    `
      SELECT
        id,
        image_url,
        image_public_id,
        eyebrow,
        title,
        subtitle,
        cta_label,
        cta_link,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM promo_slides
      ORDER BY sort_order ASC, id ASC
    `,
  );

  return result.rows;
};

const getPromoSlideById = async (id: number): Promise<PromoSlide | null> => {
  const result = await pool.query<PromoSlide>(
    `
      SELECT
        id,
        image_url,
        image_public_id,
        eyebrow,
        title,
        subtitle,
        cta_label,
        cta_link,
        sort_order,
        is_active,
        created_at,
        updated_at
      FROM promo_slides
      WHERE id = $1
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

const createPromoSlide = async (
  input: CreatePromoSlideInput,
): Promise<PromoSlide> => {
  const result = await pool.query<PromoSlide>(
    `
      INSERT INTO promo_slides (
        image_url,
        image_public_id,
        eyebrow,
        title,
        subtitle,
        cta_label,
        cta_link,
        sort_order,
        is_active
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9
      )
      RETURNING *
    `,
    [
      input.imageUrl,
      input.imagePublicId,
      input.eyebrow,
      input.title,
      input.subtitle,
      input.ctaLabel,
      input.ctaLink,
      input.sortOrder,
      input.isActive,
    ],
  );

  const promoSlide = result.rows[0];

  if (!promoSlide) {
    throw new Error("Failed to create promo slide.");
  }

  return promoSlide;
};

const updatePromoSlide = async (
  id: number,
  input: UpdatePromoSlideInput,
): Promise<PromoSlide | null> => {
  const result = await pool.query<PromoSlide>(
    `
      UPDATE promo_slides
      SET
        image_url = $1,
        image_public_id = $2,
        eyebrow = $3,
        title = $4,
        subtitle = $5,
        cta_label = $6,
        cta_link = $7,
        sort_order = $8,
        is_active = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING *
    `,
    [
      input.imageUrl,
      input.imagePublicId,
      input.eyebrow,
      input.title,
      input.subtitle,
      input.ctaLabel,
      input.ctaLink,
      input.sortOrder,
      input.isActive,
      id,
    ],
  );

  return result.rows[0] ?? null;
};

const deletePromoSlide = async (id: number): Promise<PromoSlide | null> => {
  const result = await pool.query<PromoSlide>(
    `
      DELETE FROM promo_slides
      WHERE id = $1
      RETURNING *
    `,
    [id],
  );

  return result.rows[0] ?? null;
};

export {
  getPromoSlides,
  getAdminPromoSlides,
  getPromoSlideById,
  createPromoSlide,
  updatePromoSlide,
  deletePromoSlide,
};
