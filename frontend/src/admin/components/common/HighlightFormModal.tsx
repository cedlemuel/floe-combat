import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FaCloudUploadAlt,
  FaImage,
  FaTimes,
  FaTrash,
  FaVideo,
  FaSpinner,
} from "react-icons/fa";

import type { HighlightFormValues } from "../../../types/admintypes";
import type { HighlightFormModalProps } from "../../../types/adminprops";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;

const emptyForm: HighlightFormValues = {
  title: "",
  athlete: "",
  media_type: "image",
  mediaFile: null,
  thumbnailFile: null,
  thumbnailRemoved: false,
};

const HighlightFormModal = ({
  isOpen,
  editingHighlight,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: HighlightFormModalProps) => {
  const [form, setForm] = useState<HighlightFormValues>(emptyForm);

  const [mediaPreview, setMediaPreview] = useState("");
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  const [isMediaDragging, setIsMediaDragging] = useState(false);
  const [isThumbnailDragging, setIsThumbnailDragging] = useState(false);

  const [fileError, setFileError] = useState("");

  const mediaInputRef = useRef<HTMLInputElement>(null);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setFileError("");
    setIsMediaDragging(false);
    setIsThumbnailDragging(false);

    setForm({
      title: editingHighlight?.title ?? "",
      athlete: editingHighlight?.athlete ?? "",
      media_type: editingHighlight?.media_type ?? "image",
      mediaFile: null,
      thumbnailFile: null,
      thumbnailRemoved: false,
    });

    setMediaPreview((previous) => {
      if (previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return editingHighlight?.media_url ?? "";
    });

    setThumbnailPreview((previous) => {
      if (previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return editingHighlight?.thumbnail_url ?? "";
    });

    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  }, [isOpen, editingHighlight]);

  useEffect(() => {
    return () => {
      if (mediaPreview.startsWith("blob:")) {
        URL.revokeObjectURL(mediaPreview);
      }

      if (thumbnailPreview.startsWith("blob:")) {
        URL.revokeObjectURL(thumbnailPreview);
      }
    };
  }, [mediaPreview, thumbnailPreview]);

  const handleMediaFile = (file?: File) => {
    if (!file || isSubmitting) return;

    setFileError("");

    const allowedTypes =
      form.media_type === "image" ? IMAGE_TYPES : VIDEO_TYPES;

    if (!allowedTypes.includes(file.type)) {
      setFileError(
        form.media_type === "image"
          ? "Only JPG, PNG, and WEBP images are allowed."
          : "Only MP4, WEBM, and MOV videos are allowed.",
      );

      return;
    }

    const maxSize =
      form.media_type === "image" ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;

    if (file.size > maxSize) {
      setFileError(
        form.media_type === "image"
          ? "Image must be 5 MB or smaller."
          : "Video must be 50 MB or smaller.",
      );

      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      mediaFile: file,
    }));

    setMediaPreview((previous) => {
      if (previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return previewUrl;
    });

    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  const handleThumbnailFile = (file?: File) => {
    if (!file || isSubmitting) return;

    setFileError("");

    if (!IMAGE_TYPES.includes(file.type)) {
      setFileError(
        "Video thumbnail must be a JPG, PNG, or WEBP image.",
      );

      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setFileError("Thumbnail must be 5 MB or smaller.");
      return;
    }

    const previewUrl = URL.createObjectURL(file);

    setForm((prev) => ({
      ...prev,
      thumbnailFile: file,
      thumbnailRemoved: false,
    }));

    setThumbnailPreview((previous) => {
      if (previous.startsWith("blob:")) {
        URL.revokeObjectURL(previous);
      }

      return previewUrl;
    });

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleMediaInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleMediaFile(e.target.files?.[0]);
  };

  const handleThumbnailInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    handleThumbnailFile(e.target.files?.[0]);
  };

  const handleMediaDrop = (
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    setIsMediaDragging(false);

    if (isSubmitting) return;

    handleMediaFile(e.dataTransfer.files?.[0]);
  };

  const handleThumbnailDrop = (
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    setIsThumbnailDragging(false);

    if (isSubmitting) return;

    handleThumbnailFile(e.dataTransfer.files?.[0]);
  };

  const removeMedia = () => {
    if (isSubmitting) return;

    if (mediaPreview.startsWith("blob:")) {
      URL.revokeObjectURL(mediaPreview);
    }

    setMediaPreview("");

    setForm((prev) => ({
      ...prev,
      mediaFile: null,
    }));

    if (mediaInputRef.current) {
      mediaInputRef.current.value = "";
    }
  };

  const removeThumbnail = () => {
    if (isSubmitting) return;

    if (thumbnailPreview.startsWith("blob:")) {
      URL.revokeObjectURL(thumbnailPreview);
    }

    setThumbnailPreview("");

    setForm((prev) => ({
      ...prev,
      thumbnailFile: null,
      thumbnailRemoved: true,
    }));

    if (thumbnailInputRef.current) {
      thumbnailInputRef.current.value = "";
    }
  };

  const handleMediaTypeChange = (
    mediaType: "image" | "video",
  ) => {
    if (isSubmitting) return;

    if (mediaType === form.media_type) return;

    setFileError("");

    removeMedia();

    if (mediaType === "image") {
      removeThumbnail();
    }

    setForm((prev) => ({
      ...prev,
      media_type: mediaType,
    }));
  };

  const handleSubmit = (
    e: React.SubmitEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();

    if (isSubmitting) return;

    setFileError("");

    if (!form.title.trim() || !form.athlete.trim()) {
      return;
    }

    if (!editingHighlight && !form.mediaFile) {
      setFileError("Media file is required.");
      return;
    }

    if (
      editingHighlight &&
      form.media_type !== editingHighlight.media_type &&
      !form.mediaFile
    ) {
      setFileError(
        `Please upload a new ${
          form.media_type === "image" ? "image" : "video"
        }.`,
      );

      return;
    }

    onSubmit(form);
  };

  const isEditing = editingHighlight !== null;

  const mediaAccept =
    form.media_type === "image"
      ? "image/jpeg,image/png,image/webp"
      : "video/mp4,video/webm,video/quicktime";

  const isSubmitDisabled =
    isSubmitting ||
    !form.title.trim() ||
    !form.athlete.trim() ||
    (!editingHighlight && !form.mediaFile) ||
    (editingHighlight !== null &&
      form.media_type !== editingHighlight.media_type &&
      !form.mediaFile);

  const handleClose = () => {
    if (!isSubmitting) {
      onClose();
    }
  };

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
            className="my-auto flex w-full max-w-lg max-h-[90vh] flex-col border border-white/10 bg-black"
          >
            <div className="flex items-center justify-between border-b border-white/5 px-4 py-4 sm:px-6">
              <h2 className="font-montserrat text-sm font-bold tracking-[2px] text-white">
                {isEditing
                  ? "EDIT HIGHLIGHT"
                  : "ADD HIGHLIGHT"}
              </h2>

              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center text-descText hover:text-white transition disabled:cursor-not-allowed disabled:opacity-30"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="custom-scroll flex flex-col gap-5 px-6 py-5 overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  TITLE
                </label>

                <input
                  type="text"
                  required
                  value={form.title}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="Highlight title"
                  className="w-full bg-white/2 border border-borderColor px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 outline-none focus:border-floesky/40 transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  ATHLETE
                </label>

                <input
                  type="text"
                  required
                  value={form.athlete}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      athlete: e.target.value,
                    }))
                  }
                  placeholder="Athlete name"
                  className="w-full bg-white/2 border border-borderColor px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 outline-none focus:border-floesky/40 transition disabled:opacity-50"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  MEDIA TYPE
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      handleMediaTypeChange("image")
                    }
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 border font-montserrat text-xs tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      form.media_type === "image"
                        ? "border-floesky/50 bg-floesky/10 text-floesky"
                        : "border-borderColor text-descText2 hover:text-floesky hover:border-floesky"
                    }`}
                  >
                    <FaImage size={13} />
                    IMAGE
                  </button>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() =>
                      handleMediaTypeChange("video")
                    }
                    className={`flex items-center justify-center gap-2 px-3 py-2.5 border font-montserrat text-xs tracking-wider transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      form.media_type === "video"
                        ? "border-floesky/50 bg-floesky/10 text-floesky"
                        : "border-borderColor text-descText2 hover:text-floesky hover:border-floesky"
                    }`}
                  >
                    <FaVideo size={13} />
                    VIDEO
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  {isEditing
                    ? `REPLACE ${
                        form.media_type === "image"
                          ? "IMAGE"
                          : "VIDEO"
                      } (OPTIONAL)`
                    : form.media_type === "image"
                      ? "IMAGE"
                      : "VIDEO"}
                </label>

                <input
                  ref={mediaInputRef}
                  type="file"
                  accept={mediaAccept}
                  disabled={isSubmitting}
                  onChange={handleMediaInputChange}
                  className="hidden"
                />

                {mediaPreview ? (
                  <div className="relative w-full aspect-video overflow-hidden border border-borderColor bg-white/5 group">
                    {form.media_type === "image" ? (
                      <img
                        src={mediaPreview}
                        alt="Media preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video
                        src={mediaPreview}
                        controls
                        className="w-full h-full object-contain bg-black"
                      />
                    )}

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() =>
                          mediaInputRef.current?.click()
                        }
                        className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-montserrat text-[10px] tracking-wider px-3 py-2 hover:bg-white/20 transition disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <FaCloudUploadAlt size={12} />
                        CHANGE
                      </button>

                      {mediaPreview.startsWith("blob:") && (
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={removeMedia}
                          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-montserrat text-[10px] tracking-wider px-3 py-2 hover:bg-red-500/60 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaTrash size={11} />
                          REMOVE
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => {
                      if (!isSubmitting) {
                        mediaInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();

                      if (!isSubmitting) {
                        setIsMediaDragging(true);
                      }
                    }}
                    onDragLeave={() =>
                      setIsMediaDragging(false)
                    }
                    onDrop={handleMediaDrop}
                    className={`w-full aspect-video rounded-sm border border-dashed flex flex-col items-center justify-center gap-3 transition ${
                      isSubmitting
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    } ${
                      isMediaDragging
                        ? "border-floesky bg-floesky/5"
                        : "border-borderColor bg-white/2 hover:border-floesky"
                    }`}
                  >
                    <div className="w-10 h-10 flex items-center rounded-full justify-center bg-white/5 text-descText">
                      {form.media_type === "image" ? (
                        <FaImage size={17} />
                      ) : (
                        <FaVideo size={17} />
                      )}
                    </div>

                    <div className="flex flex-col items-center gap-1">
                      <span className="font-montserrat text-xs text-descText">
                        Click to upload or drag & drop
                      </span>

                      <span className="font-montserrat text-[10px] text-descText2">
                        {form.media_type === "image"
                          ? "PNG, JPG, WEBP • MAX 5MB"
                          : "MP4, WEBM, MOV • MAX 50MB"}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {form.media_type === "video" && (
                <div className="flex flex-col gap-1.5">
                  <label className="font-montserrat text-[11px] tracking-wider text-descText2">
                    VIDEO THUMBNAIL (OPTIONAL)
                  </label>

                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    disabled={isSubmitting}
                    onChange={handleThumbnailInputChange}
                    className="hidden"
                  />

                  {thumbnailPreview ? (
                    <div className="relative w-full aspect-video overflow-hidden border border-borderColor bg-white/5 group">
                      <img
                        src={thumbnailPreview}
                        alt="Video thumbnail preview"
                        className="w-full h-full object-cover"
                      />

                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() =>
                            thumbnailInputRef.current?.click()
                          }
                          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-montserrat text-[10px] tracking-wider px-3 py-2 hover:bg-white/20 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaCloudUploadAlt size={12} />
                          CHANGE
                        </button>

                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={removeThumbnail}
                          className="flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white font-montserrat text-[10px] tracking-wider px-3 py-2 hover:bg-red-500/60 transition disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <FaTrash size={11} />
                          REMOVE
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        if (!isSubmitting) {
                          thumbnailInputRef.current?.click();
                        }
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();

                        if (!isSubmitting) {
                          setIsThumbnailDragging(true);
                        }
                      }}
                      onDragLeave={() =>
                        setIsThumbnailDragging(false)
                      }
                      onDrop={handleThumbnailDrop}
                      className={`w-full aspect-video rounded-sm border border-dashed flex flex-col items-center justify-center gap-3 transition ${
                        isSubmitting
                          ? "cursor-not-allowed opacity-50"
                          : "cursor-pointer"
                      } ${
                        isThumbnailDragging
                          ? "border-floesky bg-floesky/5"
                          : "border-white/10 bg-white/2 hover:border-floesky"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/5 text-descText">
                        <FaImage size={17} />
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <span className="font-montserrat text-xs text-descText">
                          Upload video thumbnail
                        </span>

                        <span className="font-montserrat text-[10px] text-descText2">
                          PNG, JPG, WEBP • MAX 5MB
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {(fileError || error) && (
              <div className="mx-4 mb-4 border border-red-500/20 bg-red-500/10 px-4 py-3 sm:mx-6">
                <p className="font-montserrat text-[11px] leading-relaxed text-red-400">
                  {fileError || error}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end gap-1.5 border-t border-white/5 px-4 py-4 sm:gap-3 sm:px-6">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSubmitting}
                className="font-montserrat text-xs tracking-wider text-white/40 hover:text-white px-4 py-2.5 transition disabled:cursor-not-allowed disabled:opacity-30"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSubmitDisabled}
                className="flex items-center justify-center gap-2 bg-floesky text-black font-montserrat font-bold text-xs px-5 py-2.5 tracking-wider rounded-sm hover:opacity-90 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && (
                  <FaSpinner
                    size={12}
                    className="animate-spin"
                  />
                )}

                {isSubmitting
                  ? isEditing
                    ? "SAVING..."
                    : "ADDING..."
                  : isEditing
                    ? "SAVE CHANGES"
                    : "ADD HIGHLIGHT"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HighlightFormModal;