import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaRegStar, FaSpinner, FaStar, FaTimes } from "react-icons/fa";

import type { ReviewFormValues } from "../../../types/admintypes";
import type { ReviewFormModalProps } from "../../../types/adminprops";

const emptyForm: ReviewFormValues = {
  author: "",
  role: "",
  product_id: null,
  product_name: "",
  rating: 5,
  review_text: "",
  featured: false,
};

const ReviewFormModal = ({
  isOpen,
  editingReview,
  products,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ReviewFormModalProps) => {
  const [form, setForm] = useState<ReviewFormValues>(emptyForm);

  const isEditing = editingReview !== null;

  useEffect(() => {
    if (!isOpen) return;

    if (editingReview) {
      setForm({
        author: editingReview.author,
        role: editingReview.role,
        product_id: editingReview.product_id,
        product_name: editingReview.product_name,
        rating: editingReview.rating,
        review_text: editingReview.review_text,
        featured: editingReview.featured,
      });

      return;
    }

    setForm(emptyForm);
  }, [isOpen, editingReview]);

  useEffect(() => {
    if (
      !isOpen ||
      editingReview ||
      form.product_id !== null ||
      products.length === 0
    ) {
      return;
    }

    const firstProduct = products[0];

    if (!firstProduct) return;

    setForm((prev) => ({
      ...prev,
      product_id: Number(firstProduct.id),
      product_name: firstProduct.title,
    }));
  }, [isOpen, editingReview, products, form.product_id]);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (
      !form.author.trim() ||
      !form.role.trim() ||
      !form.review_text.trim() ||
      !form.product_name ||
      form.product_id === null
    ) {
      return;
    }

    onSubmit(form);
  };

  const isSubmitDisabled =
    isSubmitting ||
    !form.author.trim() ||
    !form.role.trim() ||
    !form.review_text.trim() ||
    !form.product_name ||
    form.product_id === null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4"
        >
          <motion.form
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 20,
            }}
            transition={{ duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleSubmit}
            className="relative my-auto flex w-full max-w-lg flex-col border border-white/10 bg-black"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6">
              <h2 className="font-montserrat text-sm font-bold tracking-[2px] text-white">
                {isEditing ? "EDIT REVIEW" : "ADD REVIEW"}
              </h2>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center text-white/40 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="custom-scroll flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label className="font-montserrat text-[11px] tracking-wider text-white/40">
                    AUTHOR
                  </label>

                  <input
                    required
                    disabled={isSubmitting}
                    value={form.author}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        author: e.target.value,
                      }))
                    }
                    placeholder="e.g. Coach Ronnie DC"
                    className="border border-white/10 bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-white/20 focus:border-floesky/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-montserrat text-[11px] tracking-wider text-white/40">
                    ROLE
                  </label>

                  <input
                    required
                    disabled={isSubmitting}
                    value={form.role}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        role: e.target.value,
                      }))
                    }
                    placeholder="e.g. BJJ Purple Belt"
                    className="border border-white/10 bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-white/20 focus:border-floesky/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-white/40">
                  PRODUCT
                </label>

                <select
                  value={
                    form.product_id !== null ? String(form.product_id) : ""
                  }
                  disabled={isSubmitting || products.length === 0}
                  onChange={(e) => {
                    const selectedProduct = products.find(
                      (product) => String(product.id) === e.target.value,
                    );

                    if (!selectedProduct) return;

                    setForm((prev) => ({
                      ...prev,
                      product_id: Number(selectedProduct.id),
                      product_name: selectedProduct.title,
                    }));
                  }}
                  className="border border-white/10 bg-black px-3 py-2.5 font-montserrat text-sm text-white/80 focus:border-floesky/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {products.length === 0 ? (
                    <option value="">No products available</option>
                  ) : (
                    products.map((product) => (
                      <option key={product.id} value={String(product.id)}>
                        {product.title}
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-white/40">
                  RATING
                </label>

                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      type="button"
                      key={rating}
                      disabled={isSubmitting}
                      onClick={() =>
                        setForm((prev) => ({
                          ...prev,
                          rating,
                        }))
                      }
                      aria-label={`${rating} star${rating > 1 ? "s" : ""}`}
                      className="disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {rating <= form.rating ? (
                        <FaStar className="text-floesky" size={18} />
                      ) : (
                        <FaRegStar className="text-white/20" size={18} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-white/40">
                  REVIEW TEXT
                </label>

                <textarea
                  required
                  disabled={isSubmitting}
                  value={form.review_text}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      review_text: e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="What did they say?"
                  className="resize-none border border-white/10 bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-white/20 focus:border-floesky/40 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <label className="flex w-fit cursor-pointer select-none items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.featured}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      featured: e.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-floesky"
                />

                <span className="font-montserrat text-xs text-white/60">
                  Feature this review
                </span>
              </label>
            </div>

            {error && (
              <div className="mx-4 mb-4 border border-red-500/20 bg-red-500/10 px-4 py-3 sm:mx-6">
                <p className="font-montserrat text-[11px] leading-relaxed text-red-400">
                  {error}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-1.5 border-t border-white/5 px-4 py-4 sm:gap-3 sm:px-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="px-4 py-2.5 font-montserrat text-xs tracking-wider text-white/40 transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="flex items-center justify-center gap-2 rounded-sm bg-floesky px-5 py-2.5 font-montserrat text-xs font-bold tracking-wider text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isSubmitting && (
                  <FaSpinner size={12} className="animate-spin" />
                )}

                {isSubmitting
                  ? isEditing
                    ? "SAVING..."
                    : "ADDING..."
                  : isEditing
                    ? "SAVE CHANGES"
                    : "ADD REVIEW"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ReviewFormModal;