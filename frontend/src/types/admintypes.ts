export type ProductFormValues = {
  title: string;
  category: string;
  description: string;
  sizes: string[];
  images: File[];
  deletedImageIds: number[];
};

export type HighlightFormValues = {
  title: string;
  athlete: string;
  media_type: "image" | "video";
  mediaFile: File | null;
  thumbnailFile: File | null;
  thumbnailRemoved: boolean;
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
