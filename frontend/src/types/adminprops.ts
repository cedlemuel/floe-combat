import type {
  ProductFormValues,
  HighlightFormValues,
  ReviewFormValues,
} from "./admintypes";
import type { Product, Highlight, Review, ProductImage, CategoryOption } from "./types";

export type ProductFormModalProps = {
  isOpen: boolean;
  editingProduct: Product | null;
  categories: CategoryOption[];
  sizeOptions: string[];
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
  error?: string;
};

export type DeleteConfirmModalProps = {
  isOpen: boolean;
  title?: string;
  itemName: string;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export type ImagePreviewModalProps = {
  isOpen: boolean;
  images: ProductImage[];
  title?: string;
  onClose: () => void;
};

export type HighlightFormModalProps = {
  isOpen: boolean;
  editingHighlight: Highlight | null;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (values: HighlightFormValues) => void;
  error?: string;
};

export type ReviewFormModalProps = {
  isOpen: boolean;
  editingReview: Review | null;
  products: Product[];
  isSubmitting: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: ReviewFormValues) => void;
};

export type HighlightImagePreviewModalProps = {
  isOpen: boolean;
  imageUrl: string;
  title?: string;
  onClose: () => void;
};

export type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};
