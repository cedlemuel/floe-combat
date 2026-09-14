import { useEffect, useState } from "react";
import {
  FaImage,
  FaPen,
  FaPlay,
  FaPlus,
  FaSearch,
  FaTrash,
} from "react-icons/fa";

import type {
  CleanupAsset,
  Highlight,
  HighlightMediaInput,
} from "../../../types/types";

import type { HighlightFormValues } from "../../../types/admintypes";

import HighlightFormModal from "../../components/common/HighlightFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import HighlightPreviewModal from "../../../Components/common/HighlightPreviewModal";
import AdminPagination from "../../components/common/AdminPagination";

import usePagination from "../../../hooks/usePagination";

import {
  createHighlight,
  deleteHighlight,
  getHighlights,
  updateHighlight,
} from "../../../services/highlights.service";

import {
  cleanupCloudinaryAssets,
  uploadToCloudinary,
} from "../../../services/cloudinary.service";

const AdminHighlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);

  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(
    null,
  );

  const [error, setError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Highlight | null>(null);

  const [deleteError, setDeleteError] = useState("");

  const [previewHighlight, setPreviewHighlight] = useState<Highlight | null>(
    null,
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = highlights.filter((highlight) =>
    highlight.title.toLowerCase().includes(search.toLowerCase()),
  );

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedHighlights,
    setCurrentPage,
  } = usePagination(filtered, {
    pageSize: 8,
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, setCurrentPage]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setIsLoading(true);
        setFetchError("");

        const data = await getHighlights();

        setHighlights(data);
      } catch (error) {
        setFetchError(
          error instanceof Error
            ? error.message
            : "Could not fetch highlights.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  const openAddForm = () => {
    setError("");
    setEditingHighlight(null);
    setIsFormOpen(true);
  };

  const openEditForm = (highlight: Highlight) => {
    setError("");
    setEditingHighlight(highlight);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setError("");
    setEditingHighlight(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (values: HighlightFormValues) => {
    if (isSaving) return;

    const uploadedAssets: CleanupAsset[] = [];

    try {
      setIsSaving(true);
      setError("");

      const mediaPayload: HighlightMediaInput[] = [];

      for (const [index, item] of values.media.entries()) {
        let mediaUrl = item.media_url;
        let mediaPublicId = item.media_public_id;

        let thumbnailUrl = item.thumbnail_url ?? null;

        let thumbnailPublicId = item.thumbnail_public_id ?? null;

        if (item.mediaFile) {
          const purpose =
            item.media_type === "video" ? "highlight-video" : "highlight-image";

          const uploadedMedia = await uploadToCloudinary(
            item.mediaFile,
            purpose,
          );

          uploadedAssets.push({
            publicId: uploadedMedia.publicId,
            resourceType: uploadedMedia.resourceType,
          });

          mediaUrl = uploadedMedia.url;
          mediaPublicId = uploadedMedia.publicId;
        }

        if (!mediaUrl || !mediaPublicId) {
          throw new Error(`Media ${index + 1} is missing a file.`);
        }

        if (item.media_type === "video") {
          if (item.thumbnailFile) {
            const uploadedThumbnail = await uploadToCloudinary(
              item.thumbnailFile,
              "highlight-thumbnail",
            );

            uploadedAssets.push({
              publicId: uploadedThumbnail.publicId,
              resourceType: uploadedThumbnail.resourceType,
            });

            thumbnailUrl = uploadedThumbnail.url;

            thumbnailPublicId = uploadedThumbnail.publicId;
          }
        } else {
          thumbnailUrl = null;
          thumbnailPublicId = null;
        }

        mediaPayload.push({
          media_type: item.media_type,
          media_url: mediaUrl,
          media_public_id: mediaPublicId,
          thumbnail_url: thumbnailUrl,
          thumbnail_public_id: thumbnailPublicId,
          sort_order: index,
        });
      }

      if (editingHighlight) {
        const updatedHighlight = await updateHighlight(editingHighlight.id, {
          title: values.title.trim(),
          athlete: values.athlete.trim(),
          media: mediaPayload,
        });

        setHighlights((prev) =>
          prev.map((highlight) =>
            highlight.id === updatedHighlight.id ? updatedHighlight : highlight,
          ),
        );

        if (previewHighlight?.id === updatedHighlight.id) {
          setPreviewHighlight(updatedHighlight);
        }
      } else {
        const newHighlight = await createHighlight({
          title: values.title.trim(),
          athlete: values.athlete.trim(),
          media: mediaPayload,
        });

        setHighlights((prev) => [newHighlight, ...prev]);
      }

      closeForm();
    } catch (error) {
      try {
        await cleanupCloudinaryAssets(uploadedAssets);
      } catch (cleanupError) {
        console.error("Highlight upload cleanup failed:", cleanupError);
      }

      setError(
        error instanceof Error ? error.message : "Could not save highlight.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteHighlight(deleteTarget.id);

      setHighlights((prev) =>
        prev.filter((highlight) => highlight.id !== deleteTarget.id),
      );

      if (previewHighlight?.id === deleteTarget.id) {
        setPreviewHighlight(null);
      }

      setDeleteTarget(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Could not delete highlight.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative max-w-sm flex-1">
          <FaSearch
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-descText2"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search highlights..."
            className="w-full border border-borderColor bg-white/2 py-2.5 pl-9 pr-3 font-montserrat text-xs text-white placeholder:text-descText2 focus:border-floesky/40 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-sm bg-floesky px-4 py-2.5 font-montserrat text-xs font-bold tracking-wider text-black transition hover:opacity-90 sm:ml-auto"
        >
          <FaPlus size={10} />
          ADD HIGHLIGHT
        </button>
      </div>

      {deleteError && (
        <p className="px-1 font-montserrat text-xs text-red-400">
          {deleteError}
        </p>
      )}

      <div className="overflow-hidden border border-borderColor bg-white/2">
        <div className="hidden grid-cols-[64px_1.5fr_120px_1fr_auto] gap-4 border-b border-borderColor px-5 py-3 font-montserrat text-[11px] tracking-[2px] text-descText sm:grid">
          <span />

          <span>HIGHLIGHT</span>

          <span>MEDIA</span>

          <span>ATHLETE</span>

          <span className="text-right">ACTIONS</span>
        </div>

        {isLoading ? (
          <div className="flex flex-col divide-y divide-white/5">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="grid animate-pulse grid-cols-[64px_1fr_auto] items-center gap-4 px-5 py-3 sm:grid-cols-[64px_1.5fr_120px_1fr_auto]"
              >
                <div className="h-12 w-12 rounded-sm bg-white/5" />

                <div className="h-3 w-32 rounded-sm bg-white/5" />

                <div className="hidden h-3 w-20 rounded-sm bg-white/5 sm:block" />

                <div className="hidden h-3 w-16 rounded-sm bg-white/5 sm:block" />

                <div className="ml-auto h-3 w-12 rounded-sm bg-white/5" />
              </div>
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <p className="font-montserrat text-xs text-red-400">{fetchError}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/5">
            {paginatedHighlights.map((highlight) => {
              const primaryMedia = highlight.media[0];

              return (
                <div
                  key={highlight.id}
                  className="grid grid-cols-[64px_1fr_auto] items-center gap-4 px-5 py-3 sm:grid-cols-[64px_1.5fr_120px_1fr_auto]"
                >
                  <button
                    type="button"
                    disabled={!primaryMedia}
                    onClick={() => {
                      if (!primaryMedia) return;

                      setPreviewHighlight(highlight);
                    }}
                    aria-label={`Preview ${highlight.title}`}
                    className="group relative h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-white/5 transition hover:ring-2 hover:ring-floesky/60 disabled:cursor-default"
                  >
                    {primaryMedia?.media_type === "image" ? (
                      <img
                        src={primaryMedia.media_url}
                        alt={highlight.title}
                        className="h-full w-full object-cover"
                      />
                    ) : primaryMedia?.thumbnail_url ? (
                      <img
                        src={primaryMedia.thumbnail_url}
                        alt={`${highlight.title} thumbnail`}
                        className="h-full w-full object-cover"
                      />
                    ) : primaryMedia ? (
                      <video
                        src={primaryMedia.media_url}
                        className="h-full w-full object-cover"
                        disablePictureInPicture
                        muted
                        playsInline
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <FaImage size={12} className="text-descText2" />
                      </div>
                    )}

                    {primaryMedia?.media_type === "video" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                        <FaPlay size={10} className="text-white" />
                      </div>
                    )}

                    {highlight.media.length > 1 && (
                      <span className="absolute bottom-1 right-1 rounded-sm bg-black/80 px-1.5 py-0.5 font-montserrat text-[8px] font-bold text-white">
                        +{highlight.media.length - 1}
                      </span>
                    )}
                  </button>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-montserrat text-sm font-bold text-white">
                      {highlight.title}
                    </span>

                    <span className="truncate font-montserrat text-xs text-descText2 sm:hidden">
                      {highlight.athlete}
                    </span>
                  </div>

                  <div className="hidden items-center gap-2 sm:flex">
                    <button
                      type="button"
                      onClick={() => setPreviewHighlight(highlight)}
                      className="w-fit rounded-full border border-borderColor px-2 py-0.5 font-montserrat text-[10px] tracking-wider text-descText2 transition hover:border-floesky/50 hover:text-floesky"
                    >
                      {highlight.media.length}{" "}
                      {highlight.media.length === 1 ? "ITEM" : "ITEMS"}
                    </button>
                  </div>

                  <span className="hidden font-montserrat text-[11px] tracking-wider text-floesky sm:inline">
                    {highlight.athlete}
                  </span>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => openEditForm(highlight)}
                      aria-label={`Edit ${highlight.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm text-descText2 transition hover:bg-white/5 hover:text-floesky"
                    >
                      <FaPen size={12} />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setDeleteError("");
                        setDeleteTarget(highlight);
                      }}
                      aria-label={`Delete ${highlight.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm text-descText2 transition hover:bg-white/5 hover:text-red-400"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16">
            <span className="font-archivo text-5xl font-bold text-white/10">
              0
            </span>

            <p className="font-montserrat text-xs font-bold tracking-widest text-white/25">
              NO HIGHLIGHTS FOUND
            </p>
          </div>
        )}

        {filtered.length > 0 && (
          <AdminPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      <HighlightFormModal
        isOpen={isFormOpen}
        editingHighlight={editingHighlight}
        isSubmitting={isSaving}
        error={error}
        onClose={closeForm}
        onSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="DELETE HIGHLIGHT"
        itemName={deleteTarget?.title ?? ""}
        isDeleting={isDeleting}
        onClose={() => {
          setDeleteError("");
          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      <HighlightPreviewModal
        selected={previewHighlight}
        onClose={() => setPreviewHighlight(null)}
      />
    </div>
  );
};

export default AdminHighlights;
