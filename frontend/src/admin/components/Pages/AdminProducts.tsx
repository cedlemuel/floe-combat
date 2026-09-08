import { useEffect, useState } from "react";
import { FaPlus, FaPen, FaTrash, FaSearch, FaImage } from "react-icons/fa";
import type { ProductFormValues } from "../../../types/admintypes";
import type {
  Product,
  CleanupAsset,
  NewProductImage,
} from "../../../types/types";
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

const categories = ["SHORT SLEEVE", "LONG SLEEVE", "SPATS", "FULL SET"];
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

  const filtered = products.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory =
      categoryFilter === "ALL" || p.category === categoryFilter;
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
  }, [search, categoryFilter]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError("");

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Could not fetch products.",
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
        const uploaded = await uploadToCloudinary(file, "product-image");

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
        const updatedProduct = await updateProduct(editingProduct.id, {
          title: values.title.trim(),
          category: values.category.trim(),
          description: values.description.trim(),
          sizes: values.sizes,
          images: newImages,
          deletedImageIds: values.deletedImageIds,
        });

        setProducts((prev) =>
          prev.map((product) =>
            product.id === updatedProduct.id ? updatedProduct : product,
          ),
        );
      } else {
        const newProduct = await createProduct({
          title: values.title.trim(),
          category: values.category.trim(),
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
        console.error("Product upload cleanup failed:", cleanupError);
      }

      setError(
        error instanceof Error ? error.message : "Could not save product.",
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
        prev.filter((product) => product.id !== deleteTarget.id),
      );

      setDeleteTarget(null);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Could not delete product.",
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
            placeholder="Search products..."
            className="w-full bg-white/2 border border-borderColor pl-9 pr-3 py-2.5 font-montserrat text-xs text-white placeholder:text-descText2 focus:outline-none focus:border-floesky/40"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-white/2 border border-borderColor px-3 py-2.5 font-montserrat text-xs text-descText2 focus:outline-none focus:border-floesky/40"
        >
          <option value="ALL" className="bg-black ">
            ALL
          </option>
          {categories.map((c) => (
            <option key={c} value={c} className="bg-black">
              {c}
            </option>
          ))}
        </select>

        <button
          onClick={openAddForm}
          className="sm:ml-auto flex items-center justify-center gap-2 bg-floesky text-black font-montserrat font-bold text-xs px-4 py-2.5 tracking-wider rounded-sm hover:opacity-90 transition"
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
          <p className="font-montserrat text-xs text-red-400">{error}</p>
        </div>
      ) : (
        <div className="border border-borderColor bg-white/2 overflow-hidden">
          <div className="hidden sm:grid grid-cols-[64px_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 border-b border-borderColor font-montserrat text-[11px] tracking-[2px] text-descText">
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
                  className="grid grid-cols-[64px_1fr_auto] sm:grid-cols-[64px_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 items-center"
                >
                  <button
                    type="button"
                    onClick={() =>
                      product.images.length > 0 && setPreviewProduct(product)
                    }
                    disabled={product.images.length === 0}
                    aria-label={`Preview ${product.title} image`}
                    className="w-12 h-12 rounded-sm overflow-hidden bg-white/5 shrink-0 disabled:cursor-default enabled:cursor-zoom-in enabled:hover:ring-2 enabled:hover:ring-floesky/60 transition"
                  >
                    {product.images.length > 0 ? (
                      <img
                        src={getPrimaryImageUrl(product)}
                        alt={product.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/15">
                        <FaImage size={14} />
                      </div>
                    )}
                  </button>

                  <div className="min-w-0 flex flex-col gap-0.5">
                    <span className="font-montserrat text-sm font-bold text-white truncate">
                      {product.title}
                    </span>
                    <span className="font-montserrat text-xs text-descText2 truncate sm:hidden">
                      {product.category}
                    </span>
                    <p className="hidden sm:block font-montserrat text-xs text-descText2 truncate max-w-xs">
                      {product.description}
                    </p>
                  </div>

                  <span className="hidden sm:inline font-montserrat text-[11px] tracking-wider text-floesky">
                    {product.category}
                  </span>

                  <div className="hidden sm:flex flex-wrap gap-1">
                    {product.sizes.map((size) => (
                      <span
                        key={size}
                        className="text-[10px] px-1.5 py-0.5 border border-borderColor text-descText2"
                      >
                        {size}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditForm(product)}
                      aria-label={`Edit ${product.title}`}
                      className="w-8 h-8 flex items-center justify-center rounded-sm text-descText2 hover:text-floesky hover:bg-white/5 transition"
                    >
                      <FaPen size={12} />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(product)}
                      aria-label={`Delete ${product.title}`}
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
