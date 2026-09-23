export type PromoSlide = {
  id: number;
  image_url: string;
  image_public_id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

export type CreatePromoSlideInput = {
  imageUrl: string;
  imagePublicId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
};

export type UpdatePromoSlideInput = {
  imageUrl: string;
  imagePublicId: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaLink: string;
  sortOrder: number;
  isActive: boolean;
};