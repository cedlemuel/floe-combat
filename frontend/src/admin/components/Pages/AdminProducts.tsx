import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash, FaSearch, FaImage } from "react-icons/fa";
import type { ProductFormValues } from "../../../types/admintypes";
import type {
  Product,
  CleanupAsset,
  NewProductImage,
} from "../../../types/types";
import { categories } from "../../../types/types";
import ProductFormModal from "../../components/common/ProductFormModal";
import DeleteConfirmModal from "../common/DeleteConfirmModal";
import ImagePreviewModal from "../../components/common/ImagePreviewModal";
import AdminPagination from "../../components/common/AdminPagination";
import usePagination from "../../../hooks/usePagination";
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../../services/products.service";
import {
  cleanupCloudinaryAssets,
  uploadToCloudinary,
} from "../../../services/cloudinary.service";

const sizeOptions = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "2XL",
  "3XL",
  "4XL",
  "5XL",
  "6XL",
];

const getPrimaryImageUrl = (product: Product) => {
  return (
    product.images.find((image) => image.is_primary)?.image_url ??
    product.images[0]?.image_url ??
    ""
  );
};

const AdminProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  const filtered = products.filter((product) => {
    const matchesSearch = product.title
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      categoryFilter === "ALL" ||
      product.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  const {
    currentPage,
    totalPages,
    paginatedItems: paginatedProducts,
    setCurrentPage,
  } = usePagination(filtered, { pageSize: 8 });

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, setCurrentPage]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Could not fetch products.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const openAddForm = () => {
    setError("");
    setEditingProduct(null);
    setIsFormOpen(true);
  };

  const openEditForm = (product: Product) => {
    setError("");
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setError("");
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleFormSubmit = async (values: ProductFormValues) => {
    if (isSaving) return;

    const uploadedAssets: CleanupAsset[] = [];

    try {
      setIsSaving(true);
      setError("");

      const newImages: NewProductImage[] = [];

      for (const file of values.images) {
        const uploaded = await uploadToCloudinary(
          file,
          "product-image",
        );

        uploadedAssets.push({
          publicId: uploaded.publicId,
          resourceType: uploaded.resourceType,
        });

        newImages.push({
          image_url: uploaded.url,
          image_public_id: uploaded.publicId,
        });
      }

      if (editingProduct) {
        const updatedProduct = await updateProduct(
          editingProduct.id,
          {
            title: values.title.trim(),
            category: values.category.trim(),
            subcategory: values.subcategory,
            description: values.description.trim(),
            sizes: values.sizes,
            images: newImages,
            deletedImageIds: values.deletedImageIds,
          },
        );

        setProducts((prev) =>
          prev.map((product) =>
            product.id === updatedProduct.id
              ? updatedProduct
              : product,
          ),
        );
      } else {
        const newProduct = await createProduct({
          title: values.title.trim(),
          category: values.category.trim(),
          subcategory: values.subcategory,
          description: values.description.trim(),
          sizes: values.sizes,
          images: newImages,
        });

        setProducts((prev) => [newProduct, ...prev]);
      }

      closeForm();
    } catch (error) {
      try {
        await cleanupCloudinaryAssets(uploadedAssets);
      } catch (cleanupError) {
        console.error(
          "Product upload cleanup failed:",
          cleanupError,
        );
      }

      setError(
        error instanceof Error
          ? error.message
          : "Could not save product.",
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

      await deleteProduct(deleteTarget.id);

      setProducts((prev) =>
        prev.filter(
          (product) => product.id !== deleteTarget.id,
        ),
      );

      setDeleteTarget(null);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Could not delete product.",
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
            className="absolute top-1/2 left-3 -translate-y-1/2 text-descText2"
          />

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products..."
            className="w-full border border-borderColor bg-white/2 py-2.5 pr-3 pl-9 font-montserrat text-xs text-white placeholder:text-descText2 focus:border-floesky/40 focus:outline-none"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) =>
            setCategoryFilter(e.target.value)
          }
          className="border border-borderColor bg-white/2 px-3 py-2.5 font-montserrat text-xs text-descText2 focus:border-floesky/40 focus:outline-none"
        >
          {categories.map((category) => (
            <option
              key={category.value}
              value={category.value}
              className="bg-black"
            >
              {category.label}
            </option>
          ))}
        </select>

        <button
          onClick={openAddForm}
          className="flex items-center justify-center gap-2 rounded-sm bg-floesky px-4 py-2.5 font-montserrat text-xs font-bold tracking-wider text-black transition hover:opacity-90 sm:ml-auto"
        >
          <FaPlus size={10} />
          ADD PRODUCT
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <p className="font-montserrat text-xs font-bold tracking-widest text-white/30">
            LOADING PRODUCTS...
          </p>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center py-16">
          <p className="font-montserrat text-xs text-red-400">
            {error}
          </p>
        </div>
      ) : (
        <div className="overflow-hidden border border-borderColor bg-white/2">
          <div className="hidden grid-cols-[64px_1.5fr_1fr_1fr_auto] gap-4 border-b border-borderColor px-5 py-3 font-montserrat text-[11px] tracking-[2px] text-descText sm:grid">
            <span></span>
            <span>PRODUCT</span>
            <span>CATEGORY</span>
            <span>SIZES</span>
            <span className="text-right">ACTIONS</span>
          </div>

          {paginatedProducts.length > 0 ? (
            <div className="flex flex-col divide-y divide-white/5">
              {paginatedProducts.map((product) => (
                <div
                  key={product.id}
                  className="grid grid-cols-[64px_1fr_auto] items-center gap-4 px-5 py-3 sm:grid-cols-[64px_1.5fr_1fr_1fr_auto]"
                >
                  <button
                    type="button"
                    onClick={() =>
                      product.images.length > 0 &&
                      setPreviewProduct(product)
                    }
                    disabled={product.images.length === 0}
                    aria-label={`Preview ${product.title} image`}
                    className="h-12 w-12 shrink-0 overflow-hidden rounded-sm bg-white/5 transition disabled:cursor-default enabled:cursor-zoom-in enabled:hover:ring-2 enabled:hover:ring-floesky/60"
                  >
                    {product.images.length > 0 ? (
                      <img
                        src={getPrimaryImageUrl(product)}
                        alt={product.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-white/15">
                        <FaImage size={14} />
                      </div>
                    )}
                  </button>

                  <div className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate font-montserrat text-sm font-bold text-white">
                      {product.title}
                    </span>

                    <span className="truncate font-montserrat text-xs text-descText2 sm:hidden">
                      {product.category}
                      {product.subcategory
                        ? ` / ${product.subcategory}`
                        : ""}
                    </span>

                    <p className="hidden max-w-xs truncate font-montserrat text-xs text-descText2 sm:block">
                      {product.description}
                    </p>
                  </div>

                  <span className="hidden font-montserrat text-[11px] tracking-wider text-floesky sm:inline">
                    {product.category}

                    {product.subcategory && (
                      <span className="block text-[10px] text-descText2">
                        {product.subcategory}
                      </span>
                    )}
                  </span>

                  <div className="hidden flex-wrap gap-1 sm:flex">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="border border-borderColor px-1.5 py-0.5 text-[10px] text-descText2"
                      >
                        {size}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        openEditForm(product)
                      }
                      aria-label={`Edit ${product.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm text-descText2 transition hover:bg-white/5 hover:text-floesky"
                    >
                      <FaPen size={12} />
                    </button>

                    <button
                      onClick={() =>
                        setDeleteTarget(product)
                      }
                      aria-label={`Delete ${product.title}`}
                      className="flex h-8 w-8 items-center justify-center rounded-sm text-descText2 transition hover:bg-white/5 hover:text-red-400"
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

              <p className="font-montserrat text-xs font-bold tracking-widest text-white/25">
                NO PRODUCTS FOUND
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
      )}

      <ProductFormModal
        isOpen={isFormOpen}
        editingProduct={editingProduct}
        categories={categories}
        sizeOptions={sizeOptions}
        isSubmitting={isSaving}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        error={error}
      />

      <DeleteConfirmModal
        isOpen={deleteTarget !== null}
        title="DELETE PRODUCT"
        itemName={deleteTarget?.title ?? ""}
        isDeleting={isDeleting}
        onClose={() => {
          if (isDeleting) return;

          setDeleteTarget(null);
        }}
        onConfirm={confirmDelete}
      />

      <ImagePreviewModal
        isOpen={previewProduct !== null}
        images={previewProduct?.images ?? []}
        title={previewProduct?.title}
        onClose={() => setPreviewProduct(null)}
      />
    </div>
  );
};

export default AdminProducts;