import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaStar } from "react-icons/fa";

import type { Product, Review } from "../../types/types";
import type { SubmitReviewFormValues } from "../../types/props";

import StarRating from "../common/StarRating";
import SubmitReviewModal from "../common/SubmitReviewModal";
import FilterButton from "../common/FilterButton";
import Pagination from "../common/Pagination";

import {
  createCustomerReview,
  getApprovedReviews,
} from "../../services/reviews.service";

import { getProducts } from "../../services/products.service";
import usePagination from "../../hooks/usePagination";

const filters = ["ALL", "5", "4", "3", "2", "1"];

const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const Reviews = () => {
  const [reviewList, setReviewList] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [isReviewsLoading, setIsReviewsLoading] = useState(true);
  const [reviewsError, setReviewsError] = useState("");

  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [productsError, setProductsError] = useState("");

  const [filter, setFilter] = useState("ALL");

  const [isOpen, setIsOpen] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const approvedReviews = reviewList;

  const filtered =
    filter === "ALL"
      ? approvedReviews
      : approvedReviews.filter(
          (review) => review.rating === Number(filter),
        );

  const sortedFiltered = [...filtered].sort(
    (a, b) => Number(b.featured) - Number(a.featured),
  );

  const {
    currentPage,
    totalPages,
    paginatedItems: currentReviews,
    setCurrentPage,
  } = usePagination(sortedFiltered, {
    pageSize: 6,
  });

  const emptySlots = 6 - currentReviews.length;

  const average =
    approvedReviews.length > 0
      ? approvedReviews.reduce(
          (sum, review) => sum + review.rating,
          0,
        ) / approvedReviews.length
      : 0;

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setIsReviewsLoading(true);
        setReviewsError("");

        const data = await getApprovedReviews();

        setReviewList(data);
      } catch (error) {
        setReviewsError(
          error instanceof Error
            ? error.message
            : "Could not fetch reviews.",
        );
      } finally {
        setIsReviewsLoading(false);
      }
    };

    const fetchProducts = async () => {
      try {
        setIsProductsLoading(true);
        setProductsError("");

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        setProductsError(
          error instanceof Error
            ? error.message
            : "Could not fetch products.",
        );
      } finally {
        setIsProductsLoading(false);
      }
    };

    fetchReviews();
    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, setCurrentPage]);

  const handleSubmit = async (
    values: SubmitReviewFormValues,
  ) => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      setSubmitError("");

      await createCustomerReview({
        author: values.author,
        role: values.role || "BJJ Practitioner",
        product_id: values.product_id,
        product_name: values.product_name,
        rating: values.rating,
        review_text: values.review_text,
      });

      setIsOpen(false);
      setJustSubmitted(true);

      setTimeout(() => {
        setJustSubmitted(false);
      }, 5000);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Could not submit review.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-black">
      <div className="min-h-screen flex flex-col items-center pt-20 sm:pt-24 px-6 sm:px-10 text-white border border-borderColor pb-16 sm:pb-20">
        <div className="flex flex-col sm:flex-row justify-between items-start max-w-7xl w-full py-10 sm:py-16 lg:py-20 gap-6">
          <div className="flex flex-col gap-2">
            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: "easeOut",
              }}
              className="text-floesky font-montserrat text-xs font-bold tracking-widest"
            >
              COMMUNITY VOICES
            </motion.p>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{
                duration: 0.5,
                delay: 0.2,
                ease: "easeOut",
              }}
              className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-[8rem] font-archivo tracking-tighter leading-none"
            >
              ON THE
              <br />
              MAT
            </motion.h1>
          </div>

          <div className="flex flex-col items-end gap-2 sm:gap-1">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              transition={{
                duration: 0.5,
                delay: 0.3,
                ease: "easeOut",
              }}
              className="flex flex-col items-end gap-2 sm:gap-1"
            >
              <StarRating rating={average} />

              <span className="font-archivo text-3xl font-bold">
                {average.toFixed(1)}
              </span>
            </motion.div>

            <span className="text-descText2 font-montserrat text-sm font-bold tracking-widest">
              {approvedReviews.length} REVIEWS
            </span>
          </div>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeInUp}
          transition={{
            duration: 0.5,
            delay: 0.35,
            ease: "easeOut",
          }}
          className="w-full max-w-7xl flex flex-col items-end gap-2 pb-4"
        >
          <button
            onClick={() => {
              setSubmitError("");
              setIsOpen(true);
            }}
            disabled={
              isProductsLoading ||
              products.length === 0 ||
              !!productsError
            }
            className="border border-floesky text-floesky px-4 py-2 text-xs font-bold tracking-widest hover:bg-floesky/10 transition disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isProductsLoading
              ? "LOADING PRODUCTS..."
              : "SUBMIT REVIEW"}
          </button>

          {productsError && (
            <p className="font-montserrat text-[11px] text-red-400">
              Review submission is temporarily unavailable.
            </p>
          )}

          <AnimatePresence>
            {justSubmitted && (
              <motion.p
                initial={{
                  opacity: 0,
                  y: -6,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                className="text-floesky font-montserrat text-xs"
              >
                Thanks! Your review has been submitted and is
                awaiting approval.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex gap-2 sm:gap-4 pb-8 max-w-7xl w-full border-t border-borderColor py-6 sm:py-8 flex-wrap">
          {filters.map((filterOption, index) => (
            <FilterButton
              key={filterOption}
              label={filterOption}
              icon={<FaStar />}
              isActive={filter === filterOption}
              onClick={() => setFilter(filterOption)}
              delay={index * 0.1}
            />
          ))}
        </div>

        {isReviewsLoading ? (
          <div className="flex min-h-60 items-center justify-center w-full max-w-7xl">
            <p className="font-montserrat text-xs font-bold tracking-widest text-white/30">
              LOADING REVIEWS...
            </p>
          </div>
        ) : reviewsError ? (
          <div className="flex min-h-60 items-center justify-center w-full max-w-7xl">
            <p className="font-montserrat text-xs text-red-400">
              {reviewsError}
            </p>
          </div>
        ) : sortedFiltered.length > 0 ? (
          <div className="w-full max-w-7xl">
            <motion.div
              key={`${filter}-${currentPage}`}
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 w-full border-b border-borderColor"
            >
              {currentReviews.map((review) => (
                <motion.div
                  key={review.id}
                  variants={fadeInUp}
                  transition={{
                    duration: 0.4,
                    ease: "easeOut",
                  }}
                  className={`relative flex flex-col gap-3 p-5 sm:p-8 border-l border-t transition ${
                    review.featured
                      ? "border-floesky/40 bg-floesky/5"
                      : "border-borderColor"
                  }`}
                >
                  {review.featured && (
                    <span className="absolute top-3 right-3 sm:top-5 sm:right-5 flex items-center gap-1 bg-floesky text-black text-[10px] font-montserrat font-bold px-2 py-1 tracking-widest">
                      <FaStar size={9} />
                      FEATURED
                    </span>
                  )}

                  <StarRating rating={review.rating} />

                  <p className="text-descText text-sm font-montserrat sm:text-base wrap-break-word">
                    "{review.review_text}"
                  </p>

                  <span className="text-descText2 font-montserrat text-sm font-bold tracking-widest pt-2 border-b pb-4 border-borderColor">
                    PRODUCT: {review.product_name}
                  </span>

                  <div className="flex items-center gap-3 pt-2">
                    <div className="w-8 h-8 rounded-full bg-floesky/20 text-floesky font-archivo font-normal flex items-center justify-center">
                      {review.author
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-bold font-archivo">
                        {review.author.toUpperCase()}
                      </span>

                      <span className="text-white/40 text-xs font-montserrat font-bold">
                        {review.role.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}

              {Array.from({
                length: emptySlots,
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="invisible min-h-60"
                  aria-hidden="true"
                />
              ))}
            </motion.div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        ) : (
          <div className="flex min-h-60 items-center justify-center w-full max-w-7xl">
            <p className="font-montserrat text-xs font-bold tracking-widest text-white/25">
              NO REVIEWS YET
            </p>
          </div>
        )}
      </div>

      <SubmitReviewModal
        isOpen={isOpen}
        products={products}
        isSubmitting={isSubmitting}
        error={submitError}
        onClose={() => {
          if (isSubmitting) return;

          setIsOpen(false);
          setSubmitError("");
        }}
        onSubmit={handleSubmit}
      />
    </main>
  );
};

export default Reviews;