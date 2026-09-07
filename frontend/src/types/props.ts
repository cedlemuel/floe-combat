import type { ReactNode } from "react";
import type { HighlightFormValues } from "./admintypes";
import type { Product } from "./types";

export type ReviewProps = {
  isOpen: boolean;
  onClose: () => void;
  form: {
    rating: number;
    text: string;
    author: string;
    role: string;
    design: string;
  };
  setForm: React.Dispatch<
    React.SetStateAction<{
      rating: number;
      text: string;
      author: string;
      role: string;
      design: string;
    }>
  >;
  productOptions: string[];
  onSubmit: () => void;
};

export type ProductPreviewModalProps = {
  product: Product | null;
  onClose: () => void;
};

export type HighlightFormModalProps = {
  isOpen: boolean;
  editingHighlight: Highlight | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: HighlightFormValues) => void;
};

export type SubmitReviewFormValues = {
  author: string;
  role: string;
  product_id: number | null;
  product_name: string;
  rating: number;
  review_text: string;
};

export type ProductOption = {
  id: number;
  title: string;
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
