import { motion } from "framer-motion";
import { FaArrowLeftLong, FaArrowRightLong } from "react-icons/fa6";
import type { PaginationProps } from "../../types/props";

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-center gap-5 sm:gap-7 pt-10 sm:pt-14 mt-2 w-full">
      <motion.button
        type="button"
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        whileHover={currentPage !== 1 ? { x: -3 } : undefined}
        whileTap={currentPage !== 1 ? { scale: 0.9 } : undefined}
        aria-label="Previous page"
        className="flex items-center justify-center text-white/30 hover:text-floesky transition disabled:opacity-15 disabled:hover:text-white/30 disabled:cursor-not-allowed"
      >
        <FaArrowLeftLong size={13} />
      </motion.button>

      <div
        role="group"
        aria-label={`Page ${currentPage} of ${totalPages}`}
        className="flex items-center gap-1.5"
      >
        {Array.from({ length: totalPages }).map((_, index) => {
          const page = index + 1;
          const isActive = page === currentPage;

          return (
            <button
              key={page}
              type="button"
              onClick={() => goTo(page)}
              aria-label={`Go to page ${page}`}
              aria-current={isActive ? "page" : undefined}
              className={`relative h-0.75 rounded-full bg-white/10 overflow-hidden transition-all duration-300 ease-out ${
                isActive ? "w-7 sm:w-8" : "w-2.5 hover:bg-white/25"
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="products-pagination-active-segment"
                  className="absolute inset-0 bg-floesky"
                  transition={{ type: "spring", stiffness: 500, damping: 40 }}
                />
              )}
            </button>
          );
        })}
      </div>

      <motion.button
        type="button"
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        whileHover={currentPage !== totalPages ? { x: 3 } : undefined}
        whileTap={currentPage !== totalPages ? { scale: 0.9 } : undefined}
        aria-label="Next page"
        className="flex items-center justify-center text-white/30 hover:text-floesky transition disabled:opacity-15 disabled:hover:text-white/30 disabled:cursor-not-allowed"
      >
        <FaArrowRightLong size={13} />
      </motion.button>
    </div>
  );
};

export default Pagination;