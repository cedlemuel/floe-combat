import { useEffect, useMemo, useState } from "react";
import type { UsePaginationOptions } from "../types/types";

const usePagination = <T,>(
  items: T[],
  { pageSize = 10 }: UsePaginationOptions = {},
) => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const paginatedItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  return {
    currentPage,
    totalPages,
    paginatedItems,
    setCurrentPage,
  };
};

export default usePagination;