import { useEffect, useState } from "react";
import type { DragEvent } from "react";

import {
  FaPlus,
  FaPen,
  FaTrash,
  FaImage,
  FaGripVertical,
} from "react-icons/fa";

import PromotionFormModal from "./PromotionFormModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

import type {
  CleanupAsset,
  PromoSlide,
} from "../../../types/types";

import type { PromotionFormValues } from "../../../types/admintypes";

import {
  createPromoSlide,
  deletePromoSlide,
  getAdminPromoSlides,
  updatePromoSlide,
} from "../../../services/promotions.service";

import {
  cleanupCloudinaryAssets,
  uploadToCloudinary,
} from "../../../services/cloudinary.service";

const Promotions = () => {
  const [slides, setSlides] = useState<PromoSlide[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReordering, setIsReordering] = useState(false);

  const [error, setError] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingSlide, setEditingSlide] =
    useState<PromoSlide | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<PromoSlide | null>(null);

  const [draggedIndex, setDraggedIndex] =
    useState<number | null>(null);

  const [dragOverIndex, setDragOverIndex] =
    useState<number | null>(null);

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getAdminPromoSlides();

        setSlides(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not fetch promotions.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
  }, []);

  const openAddForm = () => {
    setError("");
    setEditingSlide(null);
    setIsFormOpen(true);
  };

  const openEditForm = (slide: PromoSlide) => {
    setError("");
    setEditingSlide(slide);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (isSaving) return;

    setError("");
    setIsFormOpen(false);
    setEditingSlide(null);
  };

  const handleSubmit = async (
    values: PromotionFormValues,
  ) => {
    if (isSaving) return;

    const uploadedAssets: CleanupAsset[] = [];

    try {
      setIsSaving(true);
      setError("");

      let imageUrl = editingSlide?.image_url;
      let imagePublicId = editingSlide?.image_public_id;

      if (values.imageFile) {
        const uploaded = await uploadToCloudinary(
          values.imageFile,
          "promo-image",
        );

        uploadedAssets.push({
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
        });

        imageUrl = uploaded.url;
        imagePublicId = uploaded.publicId;
      }

      if (!imageUrl || !imagePublicId) {
        throw new Error("Promotion image is required.");
      }

      if (editingSlide) {
        const updatedSlide = await updatePromoSlide(
          editingSlide.id,
          {
            imageUrl,
            imagePublicId,
            eyebrow: values.eyebrow.trim(),
            title: values.title.trim(),
            subtitle: values.subtitle.trim(),
            ctaLabel: values.cta_label.trim(),
            ctaLink: values.cta_link.trim(),
            sortOrder: values.sort_order,
            isActive: values.is_active,
          },
        );

        setSlides((prev) =>
          prev
            .map((slide) =>
              slide.id === updatedSlide.id
                ? updatedSlide
                : slide,
            )
            .sort(
              (a, b) =>
                a.sort_order - b.sort_order ||
                a.id - b.id,
            ),
        );
      } else {
        const newSlide = await createPromoSlide({
          imageUrl,
          imagePublicId,
          eyebrow: values.eyebrow.trim(),
          title: values.title.trim(),
          subtitle: values.subtitle.trim(),
          ctaLabel: values.cta_label.trim(),
          ctaLink: values.cta_link.trim(),
          sortOrder: values.sort_order,
          isActive: values.is_active,
        });

        setSlides((prev) =>
          [...prev, newSlide].sort(
            (a, b) =>
              a.sort_order - b.sort_order ||
              a.id - b.id,
          ),
        );
      }

      setIsFormOpen(false);
      setEditingSlide(null);
    } catch (error) {
      if (uploadedAssets.length > 0) {
        try {
          await cleanupCloudinaryAssets(uploadedAssets);
        } catch (cleanupError) {
          console.error(
            "Promotion upload cleanup failed:",
            cleanupError,
          );
        }
      }

      setError(
        error instanceof Error
          ? error.message
          : "Could not save promotion.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    try {
      setIsDeleting(true);
      setError("");

      await deletePromoSlide(deleteTarget.id);

      setSlides((prev) =>
        prev.filter(
          (slide) => slide.id !== deleteTarget.id,
        ),
      );

      setDeleteTarget(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not delete promotion.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDragStart = (index: number) => {
    if (isReordering) return;

    setDraggedIndex(index);
  };

  const handleDragOver = (
    e: DragEvent<HTMLDivElement>,
    index: number,
  ) => {
    e.preventDefault();

    if (index !== dragOverIndex) {
      setDragOverIndex(index);
    }
  };

  const handleDrop = async (index: number) => {
    if (
      draggedIndex === null ||
      draggedIndex === index ||
      isReordering
    ) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const previousSlides = [...slides];

    const reorderedSlides = [...slides];

    const [moved] = reorderedSlides.splice(
      draggedIndex,
      1,
    );

    if (!moved) return;

    reorderedSlides.splice(index, 0, moved);

    const updatedSlides = reorderedSlides.map(
      (slide, slideIndex) => ({
        ...slide,
        sort_order: slideIndex,
      }),
    );

    setSlides(updatedSlides);
    setDraggedIndex(null);
    setDragOverIndex(null);

    try {
      setIsReordering(true);
      setError("");

      await Promise.all(
        updatedSlides.map((slide) =>
          updatePromoSlide(slide.id, {
            imageUrl: slide.image_url,
            imagePublicId: slide.image_public_id,
            eyebrow: slide.eyebrow,
            title: slide.title,
            subtitle: slide.subtitle,
            ctaLabel: slide.cta_label,
            ctaLink: slide.cta_link,
            sortOrder: slide.sort_order,
            isActive: slide.is_active,
          }),
        ),
      );
    } catch (error) {
      setSlides(previousSlides);

      setError(
        error instanceof Error
          ? error.message
          : "Could not reorder slides.",
      );
    } finally {
      setIsReordering(false);
    }
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="font-montserrat text-[11px] tracking-wider text-descText">
          Drag to reorder — slides play in this order on the
          landing page.
        </p>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center gap-2 rounded-sm bg-floesky px-4 py-2.5 font-montserrat text-xs font-bold tracking-wider text-black transition hover:opacity-90"
        >
          <FaPlus size={10} />
          ADD SLIDE
        </button>
      </div>

      {error && !isFormOpen && (
        <p className="font-montserrat text-xs text-red-400">
          {error}
        </p>
      )}

      <div className="border border-borderColor bg-white/2">
        {isLoading ? (
          <div className="py-16 text-center font-montserrat text-xs text-descText2">
            LOADING SLIDES...
          </div>
        ) : slides.length > 0 ? (
          <div className="flex flex-col divide-y divide-borderColor">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onDragOver={(e) =>
                  handleDragOver(e, index)
                }
                onDrop={() => handleDrop(index)}
                className={`flex items-center gap-4 px-5 py-3 transition ${
                  draggedIndex === index
                    ? "opacity-40"
                    : ""
                } ${
                  dragOverIndex === index &&
                  draggedIndex !== index
                    ? "border-t-2 border-t-floesky"
                    : ""
                }`}
              >
                <button
                  type="button"
                  draggable={!isReordering}
                  onDragStart={() =>
                    handleDragStart(index)
                  }
                  onDragEnd={handleDragEnd}
                  aria-label={`Drag to reorder ${slide.title}`}
                  className="shrink-0 cursor-grab text-descText transition hover:text-floesky active:cursor-grabbing"
                >
                  <FaGripVertical size={14} />
                </button>

                <div className="h-12 w-20 shrink-0 overflow-hidden rounded-sm border border-borderColor bg-white/5">
                  {slide.image_url ? (
                    <img
                      src={slide.image_url}
                      alt={slide.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-descText2">
                      <FaImage size={14} />
                    </div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate font-montserrat text-sm font-bold text-white">
                    {slide.title || "Untitled slide"}
                  </span>

                  <span className="truncate font-montserrat text-xs text-descText2">
                    {slide.eyebrow}

                    {slide.cta_label
                      ? ` · ${slide.cta_label} → ${slide.cta_link}`
                      : ""}
                  </span>
                </div>

                <span
                  className={`hidden text-[10px] font-bold tracking-widest sm:block ${
                    slide.is_active
                      ? "text-green-400"
                      : "text-descText2"
                  }`}
                >
                  {slide.is_active
                    ? "ACTIVE"
                    : "INACTIVE"}
                </span>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      openEditForm(slide)
                    }
                    aria-label={`Edit ${slide.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-descText transition hover:bg-white/5 hover:text-floesky"
                  >
                    <FaPen size={12} />
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setDeleteTarget(slide)
                    }
                    aria-label={`Delete ${slide.title}`}
                    className="flex h-8 w-8 items-center justify-center rounded-sm text-descText transition hover:bg-white/5 hover:text-red-400"
                  >
                    <FaTrash size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <span className="font-archivo text-5xl font-bold text-white/10">
              0
            </span>

            <p className="font-montserrat text-xs font-bold tracking-widest text-descText2">
              NO SLIDES YET
            </p>
          </div>
        )}
      </div>

      <PromotionFormModal
        isOpen={isFormOpen}
        editingPromotion={editingSlide}
        isSubmitting={isSaving}
        error={error}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="DELETE SLIDE"
        itemName={deleteTarget?.title ?? ""}
        isDeleting={isDeleting}
        onClose={() => {
          if (isDeleting) return;

          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Promotions;