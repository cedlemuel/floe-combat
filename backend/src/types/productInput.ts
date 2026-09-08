export type CreateProductInput = {
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  sizes: string[];
};

export type UpdateProductInput = {
  title: string;
  category: string;
  subcategory: string | null;
  description: string;
  sizes: string[];
};

export type CreateProductImageInput = {
  product_id: number;
  image_url: string;
  image_public_id: string;
  is_primary: boolean;
  sort_order: number;
};
