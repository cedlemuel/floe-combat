export type Theme = "light" | "dark";

export type Product = {
  id: number;
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  sizes: string[];
  images: ProductImage[];
};

export type ProductImage = {
  id: number;
  product_id: number;
  image_url: string;
  image_public_id: string;
  is_primary: boolean;
  sort_order: number;
};

export type NewProductImage = {
  image_url: string;
  image_public_id: string;
};

export type ProductResponse = {
  success: boolean;
  message: string;
  result: Product;
};

export type ProductsResponse = {
  success: boolean;
  message: string;
  result: Product[];
};

export type ProductInput = {
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  sizes: string[];
  images: NewProductImage[];
};

export type UpdateProductInput = {
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  sizes: string[];
  images: NewProductImage[];
  deletedImageIds: number[];
};

export type Highlight = {
  id: number;
  title: string;
  athlete: string;
  media_type: "video" | "image";
  media_url: string;
  media_public_id: string;
  thumbnail_url: string | null;
  thumbnail_public_id: string | null;
};

export type HighlightResponse = {
  success: boolean;
  message: string;
  result: Highlight;
};

export type HighlightsResponse = {
  success: boolean;
  message: string;
  result: Highlight[];
};

export type CreateHighlightInput = {
  title: string;
  athlete: string;
  media_type: "image" | "video";
  media_url: string;
  media_public_id: string;
  thumbnail_url: string | null;
  thumbnail_public_id: string | null;
};

export type UpdateHighlightInput = {
  title: string;
  athlete: string;
  media_type?: "image" | "video";
  media_url?: string;
  media_public_id?: string;
  thumbnail_url?: string;
  thumbnail_public_id?: string;
  thumbnail_removed?: boolean;
};

export type ReviewStatus = "pending" | "approved" | "rejected";

export type Review = {
  id: number;
  author: string;
  role: string;
  product_id: number | null;
  product_name: string;
  rating: number;
  review_text: string;
  status: ReviewStatus;
  featured: boolean;
  created_at: string;
  updated_at: string;
};

export type ReviewsResponse = {
  success: boolean;
  message: string;
  result: Review[];
};

export type ReviewResponse = {
  success: boolean;
  message: string;
  result: Review;
};

export type CreateReviewInput = {
  author: string;
  role: string;
  product_id: number | null;
  product_name: string;
  rating: number;
  review_text: string;
  featured: boolean;
};

export type UpdateReviewInput = {
  author: string;
  role: string;
  product_id: number | null;
  product_name: string;
  rating: number;
  review_text: string;
  featured: boolean;
};

export type CreateCustomerReviewInput = {
  author: string;
  role: string;
  product_id: number | null;
  product_name: string;
  rating: number;
  review_text: string;
};

export type UploadPurpose =
  | "product-image"
  | "highlight-image"
  | "highlight-video"
  | "highlight-thumbnail";

export type UploadSignatureResponse = {
  success: boolean;
  message?: string;
  result: {
    timestamp: number;
    signature: string;
    folder: string;
    resourceType: "image" | "video";
    allowedFormats: string[];
    cloudName: string;
    apiKey: string;
  };
};

export type CloudinaryResponse = {
  secure_url: string;
  public_id: string;
  resource_type: "image" | "video";
};

export type UploadedFile = {
  url: string;
  publicId: string;
  resourceType: "image" | "video";
};

export type UsePaginationOptions = {
  pageSize?: number;
};

export type CleanupAsset = {
  publicId: string;
  resourceType: "image" | "video";
};

export type CleanupResponse = {
  success: boolean;
  message: string;
  result: {
    deleted: string[];
    skipped: string[];
    failed: string[];
  };
};

export interface CategoryOption {
  label: string;
  value: string;
  subcategories?: string[];
}

export const categories: CategoryOption[] = [
  { label: "ALL", value: "ALL" },
  { label: "TOP", value: "TOP", subcategories: ["RASHGUARD", "DRIFIT"] },
  { label: "SHORTS", value: "SHORTS" },
  { label: "GI", value: "GI" },
  { label: "SINGLETS", value: "SINGLETS" },
  { label: "FULL SET", value: "FULL SET" },
];
