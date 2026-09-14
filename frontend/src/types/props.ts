import type { ReactNode } from "react";
import type {
  CategoryOption,
  Highlight,
  Product,
} from "./types";

export type ProductPreviewModalProps = {
  product: Product | null;
  onClose: () => void;
};

export type SubmitReviewFormValues = {
  author: string;
  role: string;
  product_id: number | null;
  product_name: string;
  rating: number;
  review_text: string;
};

export type SubmitReviewModalProps = {
  isOpen: boolean;
  products: Product[];
  isSubmitting: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: SubmitReviewFormValues) => void;
};

export type FilterButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
  delay?: number;
  icon?: ReactNode;
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

export type CategoryFilterProps = {
  option: CategoryOption;
  isActive: boolean;
  activeSubcategory: string | null;
  onSelectCategory: (value: string) => void;
  onSelectSubcategory: (value: string) => void;
  delay?: number;
};

export type HighlightPreviewModalProps = {
  selected: Highlight | null;
  onClose: () => void;
};