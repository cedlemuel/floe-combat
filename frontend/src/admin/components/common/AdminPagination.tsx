import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import type { PaginationProps } from "../../../types/adminprops";

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages: number[] = [];

  const addPage = (page: number) => {
    if (!pages.includes(page)) pages.push(page);
  };

  addPage(1);

  for (let page = currentPage - 1; page <= currentPage + 1; page++) {
    if (page > 1 && page < totalPages) addPage(page);
  }

  if (totalPages > 1) addPage(totalPages);

  pages.sort((a, b) => a - b);

  const withEllipses: (number | "...")[] = [];

  pages.forEach((page, index) => {
    const prev = pages[index - 1];

    if (typeof prev === "number" && page - prev > 1) {
      withEllipses.push("...");
    }

    withEllipses.push(page);
  });

  return withEllipses;
};

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) => {
  if (totalPages <= 1) return null;

  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between gap-3 px-5 py-3 border-t border-borderColor">
      <button
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous page"
        className="w-8 h-8 flex items-center justify-center rounded-sm text-descText2 hover:text-floesky hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-descText2"
      >
        <FaChevronLeft size={10} />
      </button>

      <div className="flex items-center gap-1">
        {pageNumbers.map((page, index) =>
          page === "..." ? (
            <span
              key={`ellipsis-${index}`}
              className="w-8 h-8 flex items-center justify-center font-montserrat text-xs text-descText2"
            >
              ...
            </span>
          ) : (
            <button
              key={page}
              type="button"
              onClick={() => onPageChange(page)}
              aria-label={`Go to page ${page}`}
              aria-current={page === currentPage ? "page" : undefined}
              className={`w-8 h-8 flex items-center justify-center rounded-sm font-montserrat text-xs font-bold transition ${
                page === currentPage
                  ? "bg-floesky text-black"
                  : "text-descText2 hover:text-floesky hover:bg-white/5"
              }`}
            >
              {page}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next page"
        className="w-8 h-8 flex items-center justify-center rounded-sm text-descText2 hover:text-floesky hover:bg-white/5 transition disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-descText2"
      >
        <FaChevronRight size={10} />
      </button>
    </div>
  );
};

export default Pagination;