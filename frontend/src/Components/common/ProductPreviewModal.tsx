import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";

import type { ProductPreviewModalProps } from "../../types/props";

const ProductPreviewModal = ({
  product,
  onClose,
}: ProductPreviewModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!product) return;

    const primaryIndex = product.images.findIndex((image) => image.is_primary);

    setCurrentIndex(primaryIndex >= 0 ? primaryIndex : 0);
  }, [product]);

  useEffect(() => {
    if (!product) return;

    document.body.style.overflow = "hidden";

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }

      if (e.key === "ArrowLeft" && product.images.length > 1) {
        setCurrentIndex((prev) =>
          prev === 0 ? product.images.length - 1 : prev - 1,
        );
      }

      if (e.key === "ArrowRight" && product.images.length > 1) {
        setCurrentIndex((prev) =>
          prev === product.images.length - 1 ? 0 : prev + 1,
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const currentImage = product.images[currentIndex];

  const handlePrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? product.images.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === product.images.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-sm custom-scroll"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="relative grid w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-borderColor bg-black lg:grid-cols-[1.35fr_0.65fr]"
        >
          <button
            type="button"
            onClick={onClose}
            aria-label="Close product"
            className="absolute right-3 top-3 z-20 flex h-10 w-10 items-center justify-center bg-black/70 text-white transition hover:text-floesky"
          >
            <FaTimes size={15} />
          </button>

          <div className="flex min-w-0 flex-col border-b border-borderColor lg:border-b-0 lg:border-r">
            {currentImage && (
              <div className="relative flex min-h-100 items-center justify-center bg-black sm:min-h-130 lg:min-h-162.5">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={currentImage.id}
                    src={currentImage.image_url}
                    alt={`${product.title} ${currentIndex + 1}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="absolute inset-0 h-full w-full object-contain"
                  />
                </AnimatePresence>

                {product.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevious}
                      aria-label="Previous image"
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/60 text-white transition hover:text-floesky"
                    >
                      <FaChevronLeft size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      aria-label="Next image"
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/60 text-white transition hover:text-floesky"
                    >
                      <FaChevronRight size={14} />
                    </button>

                    <span className="absolute bottom-3 right-3 bg-black/70 px-2 py-1 font-montserrat text-[10px] text-white/60">
                      {currentIndex + 1} / {product.images.length}
                    </span>
                  </>
                )}
              </div>
            )}

            {product.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto border-t border-borderColor p-3">
                {product.images.map((image, index) => (
                  <button
                    key={image.id}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-16 w-16 shrink-0 overflow-hidden border transition ${
                      currentIndex === index
                        ? "border-floesky"
                        : "border-borderColor opacity-50 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={image.image_url}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col justify-center gap-5 p-6 sm:p-8 lg:p-10">
            <span className="font-montserrat text-xs font-bold tracking-widest text-floesky">
              {product.category}
            </span>

            <h2 className="font-archivo text-3xl font-bold tracking-tight text-white sm:text-4xl">
              {product.title}
            </h2>

            <p className="font-montserrat text-sm leading-relaxed text-descText">
              {product.description}
            </p>

            <div className="flex flex-col gap-3 border-t border-borderColor pt-5">
              <span className="font-montserrat text-[11px] tracking-widest text-white/50">
                AVAILABLE SIZES
              </span>

              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <span
                    key={size}
                    className="border border-white/20 px-3 py-1.5 font-montserrat text-xs text-white"
                  >
                    {size}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-borderColor pt-5">
              <span className="font-montserrat text-[11px] tracking-widest text-white/50">
                AVAILABLE FOR
              </span>

              <div className="flex flex-wrap gap-2">
                {["MENS", "WOMENS", "KIDS"].map((audience) => (
                  <span
                    key={audience}
                    className="border border-floesky/40 text-floesky px-3 py-1.5 font-montserrat text-xs font-bold"
                  >
                    {audience}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProductPreviewModal;