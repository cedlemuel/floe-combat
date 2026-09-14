import { AnimatePresence, motion, Reorder } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FaCloudUploadAlt,
  FaImage,
  FaSpinner,
  FaTimes,
  FaVideo,
} from "react-icons/fa";
import type {
  FormMediaItem,
  HighlightFormValues,
} from "../../../types/admintypes";
import type { HighlightFormModalProps } from "../../../types/adminprops";
import ReorderableMediaItem from "./ReorderableMediaItem";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const makeKey = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

const HighlightFormModal = ({
  isOpen,
  editingHighlight,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: HighlightFormModalProps) => {
  const [title, setTitle] = useState("");
  const [athlete, setAthlete] = useState("");
  const [media, setMedia] = useState<FormMediaItem[]>([]);
  const [fileError, setFileError] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const mediaRef = useRef<FormMediaItem[]>([]);

  const revokeObjectUrls = (items: FormMediaItem[]) => {
    for (const item of items) {
      if (item.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.previewUrl);
      }

      if (item.thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(item.thumbnailPreviewUrl);
      }
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    setFileError("");
    setTitle(editingHighlight?.title ?? "");
    setAthlete(editingHighlight?.athlete ?? "");

    setMedia((current) => {
      revokeObjectUrls(current);

      if (!editingHighlight) {
        return [];
      }

      return editingHighlight.media.map((item) => ({
        id: item.id,
        key: `existing-${item.id}`,
        media_type: item.media_type,
        mediaFile: null,
        media_url: item.media_url,
        media_public_id: item.media_public_id,
        thumbnailFile: null,
        thumbnail_url: item.thumbnail_url,
        thumbnail_public_id: item.thumbnail_public_id,
        sort_order: item.sort_order,
        previewUrl: item.media_url,
        thumbnailPreviewUrl: item.thumbnail_url ?? "",
      }));
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  }, [isOpen, editingHighlight]);

  useEffect(() => {
    mediaRef.current = media;
  }, [media]);

  useEffect(() => {
    return () => {
      revokeObjectUrls(mediaRef.current);
    };
  }, []);

  const addMediaFiles = (
    files: FileList | File[] | null,
    mediaType: "image" | "video",
  ) => {
    if (!files || files.length === 0 || isSubmitting) {
      return;
    }

    setFileError("");

    const newItems: FormMediaItem[] = [];

    for (const file of Array.from(files)) {
      const allowedTypes = mediaType === "image" ? IMAGE_TYPES : VIDEO_TYPES;

      const maxSize = mediaType === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

      if (!allowedTypes.includes(file.type)) {
        setFileError(
          mediaType === "image"
            ? "Only JPG, PNG, and WEBP images are allowed."
            : "Only MP4, WEBM, and MOV videos are allowed.",
        );

        continue;
      }

      if (file.size > maxSize) {
        setFileError(
          mediaType === "image"
            ? "Images must be 5 MB or smaller."
            : "Videos must be 50 MB or smaller.",
        );

        continue;
      }

      const previewUrl = URL.createObjectURL(file);

      newItems.push({
        key: makeKey(),
        media_type: mediaType,
        mediaFile: file,
        thumbnailFile: null,
        sort_order: 0,
        previewUrl,
        thumbnailPreviewUrl: "",
      });
    }

    setMedia((prev) =>
      [...prev, ...newItems].map((item, index) => ({
        ...item,
        sort_order: index,
      })),
    );

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (videoInputRef.current) {
      videoInputRef.current.value = "";
    }
  };

  const handleDrop = (files: FileList) => {
    if (isSubmitting) return;

    setFileError("");

    const images: File[] = [];
    const videos: File[] = [];
    let hasInvalidFile = false;

    for (const file of Array.from(files)) {
      if (IMAGE_TYPES.includes(file.type)) {
        images.push(file);
      } else if (VIDEO_TYPES.includes(file.type)) {
        videos.push(file);
      } else {
        hasInvalidFile = true;
      }
    }

    if (images.length > 0) {
      addMediaFiles(images, "image");
    }

    if (videos.length > 0) {
      addMediaFiles(videos, "video");
    }

    if (hasInvalidFile) {
      setFileError(
        "Some files were skipped. Only JPG, PNG, WEBP, MP4, WEBM, and MOV are allowed.",
      );
    }
  };

  const addThumbnail = (key: string, file: File | undefined) => {
    if (!file || isSubmitting) return;

    setFileError("");

    if (!IMAGE_TYPES.includes(file.type)) {
      setFileError("Video thumbnail must be a JPG, PNG, or WEBP image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFileError("Thumbnail must be 5 MB or smaller.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setMedia((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        if (item.thumbnailPreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.thumbnailPreviewUrl);
        }

        return {
          ...item,
          thumbnailFile: file,
          thumbnailPreviewUrl: previewUrl,
        };
      }),
    );
  };

  const removeThumbnail = (key: string) => {
    if (isSubmitting) return;

    setMedia((prev) =>
      prev.map((item) => {
        if (item.key !== key) return item;

        if (item.thumbnailPreviewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(item.thumbnailPreviewUrl);
        }

        return {
          ...item,
          thumbnailFile: null,
          thumbnail_url: null,
          thumbnail_public_id: null,
          thumbnailPreviewUrl: "",
        };
      }),
    );
  };

  const removeMedia = (key: string) => {
    if (isSubmitting) return;

    setMedia((prev) => {
      const target = prev.find((item) => item.key === key);

      if (target?.previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.previewUrl);
      }

      if (target?.thumbnailPreviewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(target.thumbnailPreviewUrl);
      }

      return prev
        .filter((item) => item.key !== key)
        .map((item, index) => ({
          ...item,
          sort_order: index,
        }));
    });
  };

  const handleReorder = (reorderedMedia: FormMediaItem[]) => {
    if (isSubmitting) return;

    setMedia(
      reorderedMedia.map((item, index) => ({
        ...item,
        sort_order: index,
      })),
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFileError("");

    if (!title.trim() || !athlete.trim()) {
      return;
    }

    if (media.length === 0) {
      setFileError("At least one image or video is required.");
      return;
    }

    const values: HighlightFormValues = {
      title: title.trim(),
      athlete: athlete.trim(),

      media: media.map((item, index) => ({
        id: item.id,
        media_type: item.media_type,
        mediaFile: item.mediaFile,
        media_url: item.media_url,
        media_public_id: item.media_public_id,
        thumbnailFile: item.thumbnailFile,
        thumbnail_url: item.thumbnail_url,
        thumbnail_public_id: item.thumbnail_public_id,
        sort_order: index,
      })),
    };

    onSubmit(values);
  };

  const handleClose = () => {
    if (isSubmitting) return;

    setMedia((current) => {
      revokeObjectUrls(current);
      return [];
    });

    onClose();
  };

  const isSubmitDisabled =
    isSubmitting || !title.trim() || !athlete.trim() || media.length === 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-3 sm:p-4"
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
            className="my-auto flex max-h-[90vh] w-full max-w-2xl flex-col border border-white/10 bg-black"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6">
              <h2 className="font-montserrat text-sm font-bold tracking-[2px] text-white">
                {editingHighlight ? "EDIT HIGHLIGHT" : "ADD HIGHLIGHT"}
              </h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center text-descText transition hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="custom-scroll flex flex-col gap-5 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  TITLE
                </label>

                <input
                  type="text"
                  required
                  value={title}
                  disabled={isSubmitting}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Highlight title"
                  className="w-full border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white outline-none transition placeholder:text-descText2 focus:border-floesky/40 disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  ATHLETE
                </label>

                <input
                  type="text"
                  required
                  value={athlete}
                  disabled={isSubmitting}
                  onChange={(e) => setAthlete(e.target.value)}
                  placeholder="Athlete name"
                  className="w-full border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white outline-none transition placeholder:text-descText2 focus:border-floesky/40 disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-montserrat text-[11px] tracking-wider text-descText">
                    MEDIA
                  </p>

                  <p className="mt-1 font-montserrat text-[10px] text-descText2">
                    Add multiple images and videos. Drag the grip to reorder.
                  </p>
                </div>

                <div className="flex gap-2">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    disabled={isSubmitting}
                    onChange={(e) => addMediaFiles(e.target.files, "image")}
                    className="hidden"
                  />

                  <input
                    ref={videoInputRef}
                    type="file"
                    accept="video/mp4,video/webm,video/quicktime"
                    multiple
                    disabled={isSubmitting}
                    onChange={(e) => addMediaFiles(e.target.files, "video")}
                    className="hidden"
                  />

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => imageInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 border border-borderColor px-3 py-2 font-montserrat text-[10px] font-bold tracking-wider text-white transition hover:border-floesky hover:text-floesky disabled:opacity-40 sm:flex-none"
                  >
                    <FaImage size={11} />
                    ADD IMAGE
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => videoInputRef.current?.click()}
                    className="flex flex-1 items-center justify-center gap-2 border border-borderColor px-3 py-2 font-montserrat text-[10px] font-bold tracking-wider text-white transition hover:border-floesky hover:text-floesky disabled:opacity-40 sm:flex-none"
                  >
                    <FaVideo size={11} />
                    ADD VIDEO
                  </button>
                </div>
              </div>

              {media.length === 0 ? (
                <div
                  onClick={() =>
                    !isSubmitting && imageInputRef.current?.click()
                  }
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();

                    if (isSubmitting) return;

                    handleDrop(e.dataTransfer.files);
                  }}
                  className="flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 border border-dashed border-borderColor bg-white/2 px-4 text-center transition hover:border-floesky/40"
                >
                  <FaCloudUploadAlt size={24} className="text-descText2" />

                  <p className="font-montserrat text-xs text-descText2">
                    Click or drag images and videos here
                  </p>
                </div>
              ) : (
                <Reorder.Group
                  axis="y"
                  values={media}
                  onReorder={handleReorder}
                  className="flex flex-col gap-3"
                >
                  {media.map((item, index) => (
                    <ReorderableMediaItem
                      key={item.key}
                      item={item}
                      index={index}
                      isSubmitting={isSubmitting}
                      onRemove={removeMedia}
                      onRemoveThumbnail={removeThumbnail}
                      onAddThumbnail={addThumbnail}
                    />
                  ))}
                </Reorder.Group>
              )}

              {(fileError || error) && (
                <p className="font-montserrat text-xs text-red-400">
                  {fileError || error}
                </p>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-white/5 px-4 py-4 sm:px-6">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleClose}
                className="px-4 py-2.5 font-montserrat text-xs font-bold tracking-wider text-descText transition hover:text-white disabled:opacity-40"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="flex min-w-28 items-center justify-center gap-2 bg-floesky px-4 py-2.5 font-montserrat text-xs font-bold tracking-wider text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting && (
                  <FaSpinner size={11} className="animate-spin" />
                )}

                {editingHighlight ? "SAVE CHANGES" : "ADD HIGHLIGHT"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HighlightFormModal;
