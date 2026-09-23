import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";

import {
  FaTimes,
  FaImage,
  FaCloudUploadAlt,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

import type { PromotionFormModalProps } from "../../../types/adminprops";
import type { PromotionFormValues } from "../../../types/admintypes";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const emptyForm: PromotionFormValues = {
  eyebrow: "",
  title: "",
  subtitle: "",
  cta_label: "",
  cta_link: "",
  sort_order: 0,
  is_active: true,
  imageFile: null,
};

const PromotionFormModal = ({
  isOpen,
  editingPromotion,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: PromotionFormModalProps) => {
  const [form, setForm] = useState<PromotionFormValues>(emptyForm);

  const [previewUrl, setPreviewUrl] = useState("");
  const [imageError, setImageError] = useState("");

  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setImageError("");

    if (editingPromotion) {
      setForm({
        eyebrow: editingPromotion.eyebrow,
        title: editingPromotion.title,
        subtitle: editingPromotion.subtitle,
        cta_label: editingPromotion.cta_label,
        cta_link: editingPromotion.cta_link,
        sort_order: editingPromotion.sort_order,
        is_active: editingPromotion.is_active,
        imageFile: null,
      });

      setPreviewUrl(editingPromotion.image_url);
    } else {
      setForm(emptyForm);
      setPreviewUrl("");
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen, editingPromotion]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
      }
    };
  }, []);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setImageError("Please select a valid image.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      setImageError("Image must not exceed 5MB.");
      return;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
    }

    const preview = URL.createObjectURL(file);

    objectUrlRef.current = preview;

    setPreviewUrl(preview);
    setImageError("");

    setForm((prev) => ({
      ...prev,
      imageFile: file,
    }));
  };

  const handleRemoveImage = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }

    setPreviewUrl("");

    setForm((prev) => ({
      ...prev,
      imageFile: null,
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setIsDragging(false);

    handleFileSelect(e.dataTransfer.files?.[0]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (!form.title.trim() || !previewUrl) return;

    onSubmit(form);
  };

  const isEditing = editingPromotion !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/70 p-3 backdrop-blur-xs sm:p-4"
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
            className="relative my-auto flex w-full max-w-lg flex-col border border-borderColor bg-black"
          >
            <div className="flex items-center justify-between border-b border-borderColor px-4 py-4 sm:px-6">
              <h2 className="font-montserrat text-sm font-bold tracking-[2px] text-white">
                {isEditing ? "EDIT SLIDE" : "ADD SLIDE"}
              </h2>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center text-descText hover:text-white transition"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="custom-scroll flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  IMAGE
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  disabled={isSubmitting}
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  className="hidden"
                />

                {previewUrl ? (
                  <div className="relative w-full aspect-video overflow-hidden rounded-sm border border-borderColor bg-white/5 group">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />

                    <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition group-hover:bg-black/50 group-hover:opacity-100">
                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={() => fileInputRef.current?.click()}
                        className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 font-montserrat text-[11px] text-white backdrop-blur-sm hover:bg-white/20 transition"
                      >
                        <FaCloudUploadAlt size={12} />
                        CHANGE
                      </button>

                      <button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleRemoveImage}
                        className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 font-montserrat text-[11px] text-white backdrop-blur-sm hover:bg-red-500/60 transition"
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
                        fileInputRef.current?.click();
                      }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();

                      if (!isSubmitting) {
                        setIsDragging(true);
                      }
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    className={`flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-sm border border-dashed cursor-pointer transition ${
                      isDragging
                        ? "border-floesky bg-floesky/5"
                        : "border-borderColor bg-white/2 hover:border-floesky"
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-descText">
                      <FaImage size={16} />
                    </div>

                    <span className="font-montserrat text-xs text-descText">
                      Click to upload or drag and drop
                    </span>

                    <span className="font-montserrat text-[10px] tracking-wider text-descText2">
                      RECOMMENDED 16:9, UP TO 5MB
                    </span>
                  </div>
                )}

                {!previewUrl && (
                  <span className="font-montserrat text-[11px] text-red-400/70">
                    An image is required.
                  </span>
                )}

                {imageError && (
                  <span className="font-montserrat text-[11px] text-red-400/70">
                    {imageError}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  EYEBROW
                </label>

                <input
                  value={form.eyebrow}
                  maxLength={100}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      eyebrow: e.target.value,
                    }))
                  }
                  placeholder="e.g. NEW ARRIVALS"
                  className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  TITLE
                </label>

                <input
                  required
                  value={form.title}
                  maxLength={255}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g. THE VORTEX"
                  className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  SUBTITLE
                </label>

                <textarea
                  value={form.subtitle}
                  disabled={isSubmitting}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      subtitle: e.target.value,
                    }))
                  }
                  rows={2}
                  placeholder="Short supporting line..."
                  className="resize-none border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-montserrat text-[11px] tracking-wider text-descText">
                    CTA LABEL
                  </label>

                  <input
                    value={form.cta_label}
                    maxLength={100}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        cta_label: e.target.value,
                      }))
                    }
                    placeholder="e.g. SHOP NOW"
                    className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="font-montserrat text-[11px] tracking-wider text-descText">
                    CTA LINK
                  </label>

                  <input
                    value={form.cta_link}
                    maxLength={255}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        cta_link: e.target.value,
                      }))
                    }
                    placeholder="/products"
                    className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="font-montserrat text-[11px] tracking-wider text-descText">
                    SORT ORDER
                  </label>

                  <input
                    type="number"
                    min={0}
                    value={form.sort_order}
                    disabled={isSubmitting}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        sort_order: Number(e.target.value),
                      }))
                    }
                    className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
                  />
                </div>

                <label className="flex items-end pb-2.5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.is_active}
                      disabled={isSubmitting}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          is_active: e.target.checked,
                        }))
                      }
                    />

                    <span className="font-montserrat text-[11px] tracking-wider text-descText">
                      ACTIVE
                    </span>
                  </div>
                </label>
              </div>

              {error && (
                <span className="font-montserrat text-[11px] text-red-400/70">
                  {error}
                </span>
              )}
            </div>

            <div className="flex items-center justify-end gap-1.5 border-t border-white/5 px-4 py-4 sm:gap-3 sm:px-6">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2.5 font-montserrat text-xs tracking-wider text-descText hover:text-white transition"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !form.title.trim() || !previewUrl}
                className="flex items-center justify-center gap-2 rounded-sm bg-floesky px-5 py-2.5 font-montserrat text-xs font-bold tracking-wider text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting && (
                  <FaSpinner className="animate-spin" size={12} />
                )}

                {isSubmitting
                  ? isEditing
                    ? "SAVING..."
                    : "ADDING..."
                  : isEditing
                    ? "SAVE CHANGES"
                    : "ADD SLIDE"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PromotionFormModal;
