import { useState, useEffect } from "react";
import {
  FaPlus,
  FaPen,
  FaTrash,
  FaSearch,
  FaImage,
  FaVideo,
} from "react-icons/fa";
import type { Highlight, UpdateHighlightInput } from "../../../types/types";
import HighlightFormModal from "../../components/common/HighlightFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import HighlightImagePreviewModal from "../../components/common/HighlightImagePreviewModal";
import VideoPreviewModal from "../../components/common/VideoPreviewModal";
import AdminPagination from "../../components/common/AdminPagination";
import usePagination from "../../../hooks/usePagination";
import type { HighlightFormValues } from "../../../types/admintypes";
import {
  getHighlights,
  createHighlight,
  deleteHighlight,
  updateHighlight,
} from "../../../services/highlights.service";
import {
  cleanupCloudinaryAssets,
  uploadToCloudinary,
} from "../../../services/cloudinary.service";

import type { CleanupAsset } from "../../../types/types";

const AdminHighlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingHighlight, setEditingHighlight] = useState<Highlight | null>(
    null,
  );

  const [deleteTarget, setDeleteTarget] = useState<Highlight | null>(null);
  const [previewImage, setPreviewImage] = useState<Highlight | null>(null);
  const [previewVideo, setPreviewVideo] = useState<Highlight | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const filtered = highlights.filter((h) =>
    h.title.toLowerCase().includes(search.toLowerCase()),
  );

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedHighlights,
    setCurrentPage,
  } = usePagination(filtered, { pageSize: 8 });

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getHighlights();

        setHighlights(data);
      } catch (error) {
        setError(
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

      const mediaPurpose =
        values.media_type === "video" ? "highlight-video" : "highlight-image";

      if (editingHighlight) {
        const updateData: UpdateHighlightInput = {
          title: values.title.trim(),
          athlete: values.athlete.trim(),
          thumbnail_removed: values.thumbnailRemoved,
        };

        if (values.mediaFile) {
          const uploadedMedia = await uploadToCloudinary(
            values.mediaFile,
            mediaPurpose,
          );

          uploadedAssets.push({
            publicId: uploadedMedia.publicId,
            resourceType: uploadedMedia.resourceType,
          });

          updateData.media_type = values.media_type;
          updateData.media_url = uploadedMedia.url;
          updateData.media_public_id = uploadedMedia.publicId;
        }

        if (values.media_type === "video" && values.thumbnailFile) {
          const uploadedThumbnail = await uploadToCloudinary(
            values.thumbnailFile,
            "highlight-thumbnail",
          );

          uploadedAssets.push({
            publicId: uploadedThumbnail.publicId,
            resourceType: uploadedThumbnail.resourceType,
          });

          updateData.thumbnail_url = uploadedThumbnail.url;
          updateData.thumbnail_public_id = uploadedThumbnail.publicId;
          updateData.thumbnail_removed = false;
        }

        const updatedHighlight = await updateHighlight(
          editingHighlight.id,
          updateData,
        );

        setHighlights((prev) =>
          prev.map((highlight) =>
            highlight.id === updatedHighlight.id ? updatedHighlight : highlight,
          ),
        );
      } else {
        if (!values.mediaFile) {
          throw new Error("Media file is required.");
        }

        const uploadedMedia = await uploadToCloudinary(
          values.mediaFile,
          mediaPurpose,
        );

        uploadedAssets.push({
          publicId: uploadedMedia.publicId,
          resourceType: uploadedMedia.resourceType,
        });

        let uploadedThumbnail: Awaited<
          ReturnType<typeof uploadToCloudinary>
        > | null = null;

        if (values.media_type === "video" && values.thumbnailFile) {
          uploadedThumbnail = await uploadToCloudinary(
            values.thumbnailFile,
            "highlight-thumbnail",
          );

          uploadedAssets.push({
            publicId: uploadedThumbnail.publicId,
            resourceType: uploadedThumbnail.resourceType,
          });
        }

        const newHighlight = await createHighlight({
          title: values.title.trim(),
          athlete: values.athlete.trim(),
          media_type: values.media_type,
          media_url: uploadedMedia.url,
          media_public_id: uploadedMedia.publicId,
          thumbnail_url: uploadedThumbnail?.url ?? null,
          thumbnail_public_id: uploadedThumbnail?.publicId ?? null,
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
      setError("");

      await deleteHighlight(deleteTarget.id);

      setHighlights((prev) =>
        prev.filter((highlight) => highlight.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not delete highlight.",
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <FaSearch
            size={12}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-descText2"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search highlights..."
            className="w-full bg-white/2 border border-borderColor pl-9 pr-3 py-2.5 font-montserrat text-xs text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
          />
        </div>

        <button
          onClick={openAddForm}
          className="sm:ml-auto flex items-center justify-center gap-2 bg-floesky text-black font-montserrat font-bold text-xs px-4 py-2.5 tracking-wider rounded-sm hover:opacity-90 transition"
        >
          <FaPlus size={10} />
          ADD HIGHLIGHT
        </button>
      </div>

      <div className="border border-borderColor bg-white/2 overflow-hidden">
        <div className="hidden sm:grid grid-cols-[64px_1.5fr_120px_1fr_auto] gap-4 px-5 py-3 border-b border-borderColor font-montserrat text-[11px] tracking-[2px] text-descText">
          <span />
          <span>HIGHLIGHT</span>
          <span>TYPE</span>
          <span>ATHLETE</span>
          <span className="text-right">ACTIONS</span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <p className="font-montserrat text-xs font-bold tracking-widest text-white/30">
              LOADING HIGHLIGHTS...
            </p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="flex flex-col divide-y divide-white/5">
            {paginatedHighlights.map((highlight) => (
              <div
                key={highlight.id}
                className="grid grid-cols-[64px_1fr_auto] sm:grid-cols-[64px_1.5fr_120px_1fr_auto] gap-4 px-5 py-3 items-center"
              >
                <button
                  type="button"
                  onClick={() =>
                    highlight.media_type === "image"
                      ? setPreviewImage(highlight)
                      : setPreviewVideo(highlight)
                  }
                  className="w-12 h-12 rounded-sm overflow-hidden bg-white/5 shrink-0 hover:ring-2 hover:ring-floesky/60 transition"
                >
                  {highlight.media_type === "image" ? (
                    <img
                      src={highlight.media_url}
                      alt={highlight.title}
                      className="w-full h-full object-cover"
                    />
                  ) : highlight.thumbnail_url ? (
                    <img
                      src={highlight.thumbnail_url}
                      alt={`${highlight.title} thumbnail`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={highlight.media_url}
                      className="w-full h-full object-cover"
                      disablePictureInPicture
                      muted
                    />
                  )}
                </button>

                <div className="min-w-0 flex flex-col gap-0.5">
                  <span className="font-montserrat text-sm font-bold text-white truncate">
                    {highlight.title}
                  </span>

                  <span className="font-montserrat text-xs text-descText2 truncate sm:hidden">
                    {highlight.athlete}
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  {highlight.media_type === "video" ? (
                    <FaVideo size={12} className="text-red-400" />
                  ) : (
                    <FaImage size={12} className="text-floesky" />
                  )}

                  <span className="font-montserrat text-[11px] tracking-wider text-descText2 uppercase">
                    {highlight.media_type}
                  </span>
                </div>

                <span className="hidden sm:inline font-montserrat text-[11px] tracking-wider text-floesky">
                  {highlight.athlete}
                </span>

                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => openEditForm(highlight)}
                    className="w-8 h-8 flex items-center justify-center rounded-sm text-descText2 hover:text-floesky hover:bg-white/5 transition"
                  >
                    <FaPen size={12} />
                  </button>

                  <button
                    onClick={() => setDeleteTarget(highlight)}
                    className="w-8 h-8 flex items-center justify-center rounded-sm text-descText2 hover:text-red-400 hover:bg-white/5 transition"
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
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />

      <HighlightImagePreviewModal
        isOpen={previewImage !== null}
        imageUrl={previewImage?.media_url ?? ""}
        title={previewImage?.title}
        onClose={() => setPreviewImage(null)}
      />

      <VideoPreviewModal
        isOpen={previewVideo !== null}
        videoUrl={previewVideo?.media_url ?? ""}
        title={previewVideo?.title}
        onClose={() => setPreviewVideo(null)}
      />
    </div>
  );
};

export default AdminHighlights;
