import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import {
  FaTimes,
  FaCloudUploadAlt,
  FaTrash,
  FaSpinner,
} from "react-icons/fa";

import type { ProductFormValues } from "../../../types/admintypes";
import type { ProductFormModalProps } from "../../../types/adminprops";
import type { ProductImage } from "../../../types/types";

const emptyForm: ProductFormValues = {
  title: "",
  category: "",
  subcategory: null,
  description: "",
  sizes: [],
  images: [],
  deletedImageIds: [],
};

const MAX_PRODUCT_IMAGES = 10;

const ProductFormModal = ({
  isOpen,
  editingProduct,
  categories,
  sizeOptions,
  onClose,
  onSubmit,
  isSubmitting,
  error,
}: ProductFormModalProps) => {
  const [form, setForm] = useState<ProductFormValues>(emptyForm);
  const [isDragging, setIsDragging] = useState(false);
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [fileError, setFileError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const objectUrlsRef = useRef<string[]>([]);

  const firstCategory =
    categories.find((category) => category.value !== "ALL")?.value ?? "";

  const selectedCategory = categories.find(
    (category) => category.value === form.category,
  );

  useEffect(() => {
    if (!isOpen) return;

    setFileError("");

    objectUrlsRef.current.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    objectUrlsRef.current = [];
    setPreviewUrls([]);

    if (editingProduct) {
      setForm({
        title: editingProduct.title,
        category: editingProduct.category,
        subcategory: editingProduct.subcategory ?? null,
        description: editingProduct.description,
        sizes: editingProduct.sizes,
        images: [],
        deletedImageIds: [],
      });

      setExistingImages(editingProduct.images);
    } else {
      setForm({
        ...emptyForm,
        category: firstCategory,
      });

      setExistingImages([]);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [isOpen, editingProduct, categories, firstCategory]);

  useEffect(() => {
    return () => {
      objectUrlsRef.current.forEach((url) => {
        URL.revokeObjectURL(url);
      });
    };
  }, []);

  const handleCategoryChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      category: value,
      subcategory: null,
    }));
  };

  const handleFileSelect = (files: File[]) => {
    setFileError("");

    const allowedTypes = ["image/jpeg", "image/png"];

    const invalidTypeFiles = files.filter(
      (file) => !allowedTypes.includes(file.type),
    );

    if (invalidTypeFiles.length > 0) {
      setFileError("Only JPG and PNG images are allowed.");
      return;
    }

    const oversizedFiles = files.filter(
      (file) => file.size > 5 * 1024 * 1024,
    );

    if (oversizedFiles.length > 0) {
      setFileError("Each image must be 5 MB or smaller.");
      return;
    }

    const availableSlots =
      MAX_PRODUCT_IMAGES - existingImages.length - form.images.length;

    if (availableSlots <= 0) {
      setFileError(
        `You can upload a maximum of ${MAX_PRODUCT_IMAGES} images.`,
      );
      return;
    }

    if (files.length > availableSlots) {
      setFileError(
        `You can only add ${availableSlots} more ${
          availableSlots === 1 ? "image" : "images"
        }.`,
      );
    }

    const selectedFiles = files.slice(0, availableSlots);

    const urls = selectedFiles.map((file) =>
      URL.createObjectURL(file),
    );

    objectUrlsRef.current.push(...urls);

    setPreviewUrls((prev) => [...prev, ...urls]);

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...selectedFiles],
    }));

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveExistingImage = (imageId: number) => {
    setExistingImages((prev) =>
      prev.filter((image) => image.id !== imageId),
    );

    setForm((prev) => ({
      ...prev,
      deletedImageIds: [...prev.deletedImageIds, imageId],
    }));
  };

  const handleRemoveNewImage = (index: number) => {
    const url = previewUrls[index];

    if (url) {
      URL.revokeObjectURL(url);

      objectUrlsRef.current = objectUrlsRef.current.filter(
        (existingUrl) => existingUrl !== url,
      );
    }

    setPreviewUrls((prev) =>
      prev.filter((_, i) => i !== index),
    );

    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleDrop = (
    e: React.DragEvent<HTMLDivElement>,
  ) => {
    e.preventDefault();
    setIsDragging(false);

    handleFileSelect(Array.from(e.dataTransfer.files));
  };

  const toggleSize = (size: string) => {
    setForm((prev) => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter((s) => s !== size)
        : [...prev.sizes, size],
    }));
  };

  const totalImages =
    existingImages.length + form.images.length;

  const handleSubmit = (e: React.SubmitEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    if (
      !form.title.trim() ||
      !form.category ||
      !form.description.trim() ||
      form.sizes.length === 0 ||
      totalImages === 0
    ) {
      return;
    }

    onSubmit(form);
  };

  const isEditing = editingProduct !== null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (!isSubmitting) {
              onClose();
            }
          }}
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
                {isEditing
                  ? "EDIT PRODUCT"
                  : "ADD PRODUCT"}
              </h2>

              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    onClose();
                  }
                }}
                aria-label="Close"
                className="flex h-8 w-8 items-center justify-center text-descText transition hover:text-white"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="custom-scroll flex max-h-[70vh] flex-col gap-4 overflow-y-auto px-4 py-5 sm:px-6">
              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  TITLE
                </label>

                <input
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  placeholder="e.g. Night Lotus"
                  className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:border-floesky/40 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  CATEGORY
                </label>

                <select
                  value={form.category}
                  onChange={(e) =>
                    handleCategoryChange(
                      e.target.value,
                    )
                  }
                  className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white focus:border-floesky/40 focus:outline-none"
                >
                  {categories
                    .filter(
                      (category) =>
                        category.value !== "ALL",
                    )
                    .map((category) => (
                      <option
                        key={category.value}
                        value={category.value}
                        className="bg-black"
                      >
                        {category.label}
                      </option>
                    ))}
                </select>
              </div>

              {selectedCategory?.subcategories
                ?.length ? (
                <div className="flex flex-col gap-1.5">
                  <label className="font-montserrat text-[11px] tracking-wider text-descText">
                    SUBCATEGORY
                  </label>

                  <select
                    value={
                      form.subcategory ?? ""
                    }
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        subcategory:
                          e.target.value ||
                          null,
                      }))
                    }
                    className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white focus:border-floesky/40 focus:outline-none"
                  >
                    <option
                      value=""
                      className="bg-black"
                    >
                      Select subcategory
                    </option>

                    {selectedCategory.subcategories.map(
                      (subcategory) => (
                        <option
                          key={subcategory}
                          value={subcategory}
                          className="bg-black"
                        >
                          {subcategory}
                        </option>
                      ),
                    )}
                  </select>
                </div>
              ) : null}

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  DESCRIPTION
                </label>

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description:
                        e.target.value,
                    }))
                  }
                  rows={4}
                  placeholder="Short product description..."
                  className="resize-none border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-sm text-white placeholder:text-descText2 focus:border-floesky/40 focus:outline-none"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  PRODUCT IMAGES
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png"
                  multiple
                  onChange={(e) =>
                    handleFileSelect(
                      Array.from(
                        e.target.files ?? [],
                      ),
                    )
                  }
                  className="hidden"
                />

                {(existingImages.length > 0 ||
                  previewUrls.length > 0) && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {existingImages.map(
                      (image) => (
                        <div
                          key={image.id}
                          className="group relative aspect-square overflow-hidden border border-borderColor bg-white/5"
                        >
                          <img
                            src={image.image_url}
                            alt="Product"
                            className="h-full w-full object-cover"
                          />

                          {image.is_primary && (
                            <span className="absolute top-2 left-2 bg-floesky px-2 py-1 font-montserrat text-[9px] font-bold text-black">
                              PRIMARY
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExistingImage(
                                image.id,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-black/70 text-white transition hover:text-red-400 disabled:opacity-50"
                            aria-label="Remove image"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      ),
                    )}

                    {previewUrls.map(
                      (url, index) => (
                        <div
                          key={url}
                          className="group relative aspect-square overflow-hidden border border-floesky/30 bg-white/5"
                        >
                          <img
                            src={url}
                            alt={`New product image ${
                              index + 1
                            }`}
                            className="h-full w-full object-cover"
                          />

                          <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-1 font-montserrat text-[9px] text-floesky">
                            NEW
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveNewImage(
                                index,
                              )
                            }
                            disabled={
                              isSubmitting
                            }
                            className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center bg-black/70 text-white transition hover:text-red-400 disabled:opacity-50"
                            aria-label="Remove new image"
                          >
                            <FaTrash size={10} />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}

                {totalImages <
                  MAX_PRODUCT_IMAGES && (
                  <div
                    onClick={() =>
                      fileInputRef.current?.click()
                    }
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() =>
                      setIsDragging(false)
                    }
                    onDrop={handleDrop}
                    className={`flex aspect-video w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-sm border border-dashed transition ${
                      isDragging
                        ? "border-floesky bg-floesky/5"
                        : "border-borderColor bg-white/2 hover:border-floesky"
                    }`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-descText">
                      <FaCloudUploadAlt
                        size={16}
                      />
                    </div>

                    <span className="font-montserrat text-xs text-descText">
                      Click to upload or drag and drop
                    </span>

                    <span className="font-montserrat text-[10px] tracking-wider text-descText2">
                      PNG, JPG • MAX 10 IMAGES
                    </span>

                    <span className="font-montserrat text-[10px] text-floesky">
                      {totalImages}/
                      {MAX_PRODUCT_IMAGES}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-montserrat text-[11px] tracking-wider text-descText">
                  AVAILABLE SIZES
                </label>

                <div className="flex flex-wrap gap-2">
                  {sizeOptions.map((size) => {
                    const active =
                      form.sizes.includes(size);

                    return (
                      <button
                        type="button"
                        key={size}
                        onClick={() =>
                          toggleSize(size)
                        }
                        className={`border px-3 py-1.5 font-montserrat text-xs transition ${
                          active
                            ? "border-floesky bg-floesky font-bold text-black"
                            : "border-borderColor text-descText hover:border-white/30"
                        }`}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>

                {form.sizes.length === 0 && (
                  <span className="font-montserrat text-[11px] text-red-400/70">
                    Select at least one size.
                  </span>
                )}
              </div>
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
                onClick={() => {
                  if (!isSubmitting) {
                    onClose();
                  }
                }}
                className="px-4 py-2.5 font-montserrat text-xs tracking-wider text-descText transition hover:text-white"
              >
                CANCEL
              </button>

              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  !form.title.trim() ||
                  !form.category ||
                  !form.description.trim() ||
                  form.sizes.length === 0 ||
                  totalImages === 0
                }
                className="flex items-center justify-center gap-2 rounded-sm bg-floesky px-5 py-2.5 font-montserrat text-xs font-bold tracking-wider text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-30"
              >
                {isSubmitting && (
                  <FaSpinner
                    className="animate-spin"
                    size={12}
                  />
                )}

                {isSubmitting
                  ? isEditing
                    ? "SAVING..."
                    : "ADDING..."
                  : isEditing
                    ? "SAVE CHANGES"
                    : "ADD PRODUCT"}
              </button>
            </div>
          </motion.form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProductFormModal;