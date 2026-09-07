import { useState, useEffect } from "react";
import {
  FaPlus,
  FaPen,
  FaTrash,
  FaSearch,
  FaStar,
  FaCheck,
  FaTimes,
} from "react-icons/fa";
import type { Product, Review } from "../../../types/types";
import type { ReviewFormValues } from "../../../types/admintypes";
import ReviewFormModal from "../../components/common/ReviewFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import AdminPagination from "../../components/common/AdminPagination";
import usePagination from "../../../hooks/usePagination";
import {
  createAdminReview,
  deleteReview,
  getAdminReviews,
  updateAdminReview,
  updateReviewFeatured,
  updateReviewStatus,
} from "../../../services/reviews.service";
import { getProducts } from "../../../services/products.service";

const ratingFilters = ["ALL", "5", "4", "3", "2", "1"];

type Tab = "pending" | "approved";

const AdminReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  const [updatingFeaturedId, setUpdatingFeaturedId] = useState<number | null>(
    null,
  );

  const [tab, setTab] = useState<Tab>("pending");

  const [search, setSearch] = useState("");
  const [ratingFilter, setRatingFilter] = useState("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Review | null>(null);
  const [rejectTarget, setRejectTarget] = useState<Review | null>(null);

  const pending = reviews.filter((r) => r.status === "pending");
  const approved = reviews.filter((r) => r.status === "approved");

  const filteredApproved = approved.filter((r) => {
    const matchesSearch = r.author.toLowerCase().includes(search.toLowerCase());
    const matchesRating =
      ratingFilter === "ALL" || r.rating === Number(ratingFilter);
    return matchesSearch && matchesRating;
  });

  const {
    currentPage: pendingPage,
    totalPages: pendingTotalPages,
    paginatedItems: paginatedPending,
    setCurrentPage: setPendingPage,
  } = usePagination(pending, { pageSize: 8 });

  const {
    currentPage: approvedPage,
    totalPages: approvedTotalPages,
    paginatedItems: paginatedApproved,
    setCurrentPage: setApprovedPage,
  } = usePagination(filteredApproved, { pageSize: 9 });

  useEffect(() => {
    setApprovedPage(1);
  }, [search, ratingFilter]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError("");

        const [reviewsData, productsData] = await Promise.all([
          getAdminReviews(),
          getProducts(),
        ]);

        setReviews(reviewsData);
        setProducts(productsData);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Could not fetch data.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const openAddForm = () => {
    setEditingReview(null);
    setIsFormOpen(true);
  };

  const openEditForm = (review: Review) => {
    setEditingReview(review);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingReview(null);
  };

  const handleFormSubmit = async (values: ReviewFormValues) => {
    if (isSaving) return;

    try {
      setIsSaving(true);
      setError("");

      if (editingReview) {
        const updatedReview = await updateAdminReview(editingReview.id, {
          author: values.author,
          role: values.role || "BJJ Practitioner",
          product_id: values.product_id,
          product_name: values.product_name,
          rating: values.rating,
          review_text: values.review_text,
          featured: values.featured,
        });

        setReviews((prev) =>
          prev.map((review) =>
            review.id === updatedReview.id ? updatedReview : review,
          ),
        );
      } else {
        const newReview = await createAdminReview({
          author: values.author,
          role: values.role || "BJJ Practitioner",
          product_id: values.product_id,
          product_name: values.product_name,
          rating: values.rating,
          review_text: values.review_text,
          featured: values.featured,
        });

        setReviews((prev) => [newReview, ...prev]);
      }

      closeForm();
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not save review.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const approveReview = async (review: Review) => {
    try {
      setError("");

      const updatedReview = await updateReviewStatus(review.id, "approved");

      setReviews((prev) =>
        prev.map((item) =>
          item.id === updatedReview.id ? updatedReview : item,
        ),
      );

      window.dispatchEvent(new Event("reviews-updated"));
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not approve review.",
      );
    }
  };

  const confirmReject = async () => {
    if (!rejectTarget || isRejecting) return;

    try {
      setIsRejecting(true);
      setError("");

      await deleteReview(rejectTarget.id);

      setReviews((prev) =>
        prev.filter((review) => review.id !== rejectTarget.id),
      );

      window.dispatchEvent(new Event("reviews-updated"));

      setRejectTarget(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not reject review.",
      );
    } finally {
      setIsRejecting(false);
    }
  };

  const toggleFeatured = async (review: Review) => {
    if (updatingFeaturedId === review.id) return;

    try {
      setUpdatingFeaturedId(review.id);
      setError("");

      const updatedReview = await updateReviewFeatured(
        review.id,
        !review.featured,
      );

      setReviews((prev) =>
        prev.map((item) =>
          item.id === updatedReview.id ? updatedReview : item,
        ),
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not update featured status.",
      );
    } finally {
      setUpdatingFeaturedId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    try {
      setIsDeleting(true);
      setError("");

      await deleteReview(deleteTarget.id);

      setReviews((prev) =>
        prev.filter((review) => review.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not delete review.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex gap-2">
        <button
          onClick={() => setTab("pending")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-montserrat font-bold tracking-wider border transition ${
            tab === "pending"
              ? "border-floesky bg-floesky/10 text-floesky"
              : "border-borderColor text-descText hover:border-floesky hover:text-floesky"
          }`}
        >
          PENDING
          {pending.length > 0 && (
            <span className="bg-floesky text-black text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {pending.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setTab("approved")}
          className={`px-4 py-2 text-xs font-montserrat font-bold tracking-wider border transition ${
            tab === "approved"
              ? "border-floesky bg-floesky/10 text-floesky"
              : "border-borderColor text-descText hover:border-floesky hover:text-floesky"
          }`}
        >
          APPROVED ({approved.length})
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="font-montserrat text-xs font-bold tracking-widest text-white/30">
            LOADING REVIEWS...
          </p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <p className="font-montserrat text-xs text-red-400">{error}</p>
        </div>
      ) : tab === "pending" ? (
        <div className="border border-borderColor bg-white/2 overflow-hidden">
          {pending.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {paginatedPending.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4"
                >
                  <div className="w-9 h-9 rounded-full bg-floesky/10 text-floesky font-archivo flex items-center justify-center text-sm shrink-0">
                    {review.author.charAt(0).toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1 flex flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-montserrat text-sm font-bold text-white">
                        {review.author}
                      </span>
                      <span className="font-montserrat text-[11px] text-descText">
                        {review.role}
                      </span>
                      <span className="font-montserrat text-[11px] tracking-wider text-floesky">
                        {review.product_name}
                      </span>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar
                            key={i}
                            size={10}
                            className={
                              i < review.rating
                                ? "text-floesky"
                                : "text-descText2"
                            }
                          />
                        ))}
                      </div>
                    </div>
                    <p className="font-montserrat text-xs text-descText2 leading-relaxed">
                      "{review.review_text}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <button
                      onClick={() => approveReview(review)}
                      className="flex items-center gap-1.5 bg-floesky text-black font-montserrat font-bold text-[11px] px-3 py-1.5 tracking-wider rounded-sm hover:opacity-90 transition"
                    >
                      <FaCheck size={10} />
                      APPROVE
                    </button>
                    <button
                      onClick={() => setRejectTarget(review)}
                      className="flex items-center gap-1.5 border border-borderColor text-descText font-montserrat text-[11px] px-3 py-1.5 tracking-wider hover:border-red-400/50 hover:text-red-400 transition"
                    >
                      <FaTimes size={10} />
                      REJECT
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 py-16">
              <span className="text-descText2 font-archivo text-5xl font-bold">
                0
              </span>
              <p className="text-descText2 font-montserrat text-xs font-bold tracking-widest">
                NOTHING WAITING ON APPROVAL
              </p>
            </div>
          )}

          {pending.length > 0 && (
            <AdminPagination
              currentPage={pendingPage}
              totalPages={pendingTotalPages}
              onPageChange={setPendingPage}
            />
          )}
        </div>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="relative flex-1 max-w-sm">
              <FaSearch
                size={12}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-descText"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by author..."
                className="w-full bg-white/2 border border-borderColor pl-9 pr-3 py-2.5 font-montserrat text-xs text-white placeholder:text-descText focus:outline-none focus:border-floesky/40"
              />
            </div>

            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="bg-white/2 border border-borderColor px-3 py-2.5 font-montserrat text-xs text-descText focus:outline-none focus:border-floesky/40"
            >
              {ratingFilters.map((f) => (
                <option key={f} value={f} className="bg-black">
                  {f === "ALL" ? "ALL RATINGS" : `${f} STAR`}
                </option>
              ))}
            </select>

            <button
              onClick={openAddForm}
              className="sm:ml-auto flex items-center justify-center gap-2 bg-floesky text-black font-montserrat font-bold text-xs px-4 py-2.5 tracking-wider rounded-sm hover:opacity-90 transition"
            >
              <FaPlus size={10} />
              ADD REVIEW
            </button>
          </div>

          <div className="border border-borderColor bg-white/2 overflow-hidden">
            <div className="hidden sm:grid grid-cols-[48px_1.3fr_1fr_0.8fr_auto_auto] gap-4 px-5 py-3 border-b border-borderColor font-montserrat text-[11px] tracking-[2px] text-descText">
              <span></span>
              <span>REVIEW</span>
              <span>DESIGN</span>
              <span>RATING</span>
              <span>FEATURED</span>
              <span className="text-right">ACTIONS</span>
            </div>

            {filteredApproved.length > 0 ? (
              <div className="flex flex-col divide-y divide-white/5">
                {paginatedApproved.map((review) => (
                  <div
                    key={review.id}
                    className="grid grid-cols-[48px_1fr_auto] sm:grid-cols-[48px_1.3fr_1fr_0.8fr_auto_auto] gap-4 px-5 py-3 items-center"
                  >
                    <div className="w-9 h-9 rounded-full bg-floesky/10 text-floesky font-archivo flex items-center justify-center text-sm shrink-0">
                      {review.author.charAt(0).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-montserrat text-sm font-bold text-white truncate">
                          {review.author}
                        </span>
                        <span className="font-montserrat text-[11px] text-descText truncate hidden sm:inline">
                          {review.role}
                        </span>
                      </div>
                      <p className="font-montserrat text-xs text-descText2 truncate max-w-sm">
                        {review.review_text}
                      </p>
                    </div>

                    <span className="hidden sm:inline font-montserrat text-[11px] tracking-wider text-floesky">
                      {review.product_name}
                    </span>

                    <div className="hidden sm:flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <FaStar
                          key={i}
                          size={11}
                          className={
                            i < review.rating
                              ? "text-floesky"
                              : "text-descText2"
                          }
                        />
                      ))}
                    </div>

                    <button
                      onClick={() => toggleFeatured(review)}
                      disabled={updatingFeaturedId === review.id}
                      className={`hidden sm:inline-flex items-center justify-center w-fit px-2.5 py-1 text-[10px] font-montserrat font-bold tracking-wider border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                        review.featured
                          ? "border-floesky bg-floesky/10 text-floesky"
                          : "border-borderColor text-descText2 hover:border-floesky hover:text-floesky"
                      }`}
                    >
                      {updatingFeaturedId === review.id
                        ? "UPDATING..."
                        : review.featured
                          ? "FEATURED"
                          : "REGULAR"}
                    </button>

                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openEditForm(review)}
                        aria-label={`Edit review by ${review.author}`}
                        className="w-8 h-8 flex items-center justify-center rounded-sm text-white/40 hover:text-floesky hover:bg-white/5 transition"
                      >
                        <FaPen size={12} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(review)}
                        aria-label={`Delete review by ${review.author}`}
                        className="w-8 h-8 flex items-center justify-center rounded-sm text-white/40 hover:text-red-400 hover:bg-white/5 transition"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-16">
                <span className="text-white/10 font-archivo text-5xl font-bold">
                  0
                </span>
                <p className="text-white/25 font-montserrat text-xs font-bold tracking-widest">
                  NO REVIEWS FOUND
                </p>
              </div>
            )}

            {filteredApproved.length > 0 && (
              <AdminPagination
                currentPage={approvedPage}
                totalPages={approvedTotalPages}
                onPageChange={setApprovedPage}
              />
            )}
          </div>
        </>
      )}

      <ReviewFormModal
        isOpen={isFormOpen}
        editingReview={editingReview}
        products={products}
        isSubmitting={isSaving}
        error={error}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="DELETE REVIEW"
        itemName={deleteTarget?.author ?? ""}
        isDeleting={isDeleting}
        onClose={() => {
          if (isDeleting) return;
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      <DeleteConfirmModal
        isOpen={rejectTarget !== null}
        title="REJECT REVIEW"
        itemName={rejectTarget?.author ?? ""}
        isDeleting={isRejecting}
        onClose={() => {
          if (isRejecting) return;
          setRejectTarget(null);
        }}
        onConfirm={confirmReject}
      />
    </div>
  );
};

export default AdminReviews;