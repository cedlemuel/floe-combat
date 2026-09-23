export type ProductFormValues = {
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  sizes: string[];
  images: File[];
  deletedImageIds: number[];
};

export type HighlightMediaFormItem = {
  id?: number;
  media_type: "image" | "video";
  mediaFile: File | null;
  media_url?: string;
  media_public_id?: string;
  thumbnailFile: File | null;
  thumbnail_url?: string | null;
  thumbnail_public_id?: string | null;
  sort_order: number;
};

export type HighlightFormValues = {
  title: string;
  athlete: string;
  media: HighlightMediaFormItem[];
};

export type ReviewFormValues = {
  author: string;
  role: string;
  product_id: number | null;
  product_name: string;
  rating: number;
  review_text: string;
  featured: boolean;
};

export type AdminLoginResponse = {
  success: boolean;
  message: string;
  result: {
    id: number;
    email: string;
    token: string;
  };
};

export type AdminLoginInput = {
  email: string;
  password: string;
};

export type Tab = "hero" | "carousel" | "showcase";

export const tabs: { id: Tab; label: string }[] = [
  { id: "carousel", label: "CAROUSEL" },
  { id: "hero", label: "HERO" },
  { id: "showcase", label: "SHOWCASE" },
];

export type FormMediaItem = HighlightMediaFormItem & {
  key: string;
  previewUrl: string;
  thumbnailPreviewUrl: string;
};

export type ReorderableMediaItemProps = {
  item: FormMediaItem;
  index: number;
  isSubmitting: boolean;
  onRemove: (key: string) => void;
  onRemoveThumbnail: (key: string) => void;
  onAddThumbnail: (key: string, file: File | undefined) => void;
};

export type PromotionFormValues = {
  eyebrow: string;
  title: string;
  subtitle: string;
  cta_label: string;
  cta_link: string;
  sort_order: number;
  is_active: boolean;
  imageFile: File | null;
};
