import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import FilterButton from "../common/FilterButton";
import type { Product } from "../../types/types";
import { getProducts } from "../../services/products.service";
import ProductPreviewModal from "../common/ProductPreviewModal";
import ProductSkeleton from "../common/ProductSkeleton";
import Pagination from "../common/Pagination";

const categories = ["ALL", "SHORT SLEEVE", "LONG SLEEVE", "SPATS", "FULL SET"];

const getPrimaryImageUrl = (product: Product) => {
  return (
    product.images.find((image) => image.is_primary)?.image_url ??
    product.images[0]?.image_url ??
    ""
  );
};

const Products = () => {
  const [active, setActive] = useState("ALL");
  const [selected, setSelected] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 6;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setFetchError("");

        const data = await getProducts();

        setProducts(data);
      } catch (error) {
        setFetchError(
          error instanceof Error ? error.message : "Could not fetch products.",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = selected ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selected]);

  const filtered =
    active === "ALL"
      ? products
      : products.filter((product) => product.category === active);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;

  const currentProducts = filtered.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const emptySlots = itemsPerPage - currentProducts.length;

  return (
    <main className="min-h-screen bg-black">
      <div className="min-h-screen flex flex-col items-center pt-20 sm:pt-24 px-6 sm:px-10 text-white border-b border-borderColor">
        <div className="flex flex-col max-w-7xl w-full py-10 sm:py-16 lg:py-20 gap-2">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-floesky font-montserrat text-xs sm:text-sm font-bold tracking-widest"
          >
            THE DESIGN DOSSIER
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-archivo tracking-tighter leading-none"
          >
            PRODUCTS
          </motion.h1>
        </div>

        <div className="flex gap-2 sm:gap-4 py-6 sm:py-8 max-w-7xl w-full border-y border-borderColor flex-wrap">
          {categories.map((cat, i) => (
            <FilterButton
              key={cat}
              label={cat}
              isActive={active === cat}
              onClick={() => setActive(cat)}
              delay={0.1 * i}
            />
          ))}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 max-w-7xl w-full pb-16 sm:pb-20">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductSkeleton key={index} />
            ))}
          </div>
        ) : fetchError ? (
          <div className="flex min-h-60 items-center justify-center w-full max-w-7xl">
            <p className="font-montserrat text-xs text-red-400">{fetchError}</p>
          </div>
        ) : filtered.length > 0 ? (
          <div className="w-full max-w-7xl pb-16 sm:pb-20">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 w-full">
              {currentProducts.map((project, i) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  onClick={() => setSelected(project)}
                  className="group relative aspect-4/5 overflow-hidden cursor-pointer"
                >
                  <img
                    src={getPrimaryImageUrl(project)}
                    alt={project.title}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-linear-to-t from-black via-black/40 to-transparent" />

                  <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 flex flex-col gap-1.5 sm:gap-2">
                    <span className="text-floesky font-montserrat text-xs font-bold tracking-widest">
                      {project.category}
                    </span>

                    <h3 className="font-archivo text-xl sm:text-2xl font-bold tracking-tight">
                      {project.title}
                    </h3>

                    <p className="text-descText font-montserrat text-xs sm:text-sm leading-relaxed line-clamp-2">
                      {project.description}
                    </p>

                    <div className="flex flex-wrap gap-1 mt-2">
                      {project.sizes.map((size) => (
                        <span
                          key={size}
                          className="text-[10px] px-2 py-0.5 border border-white/20 text-white/70"
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}

              {Array.from({ length: emptySlots }, (_, index) => (
                <div
                  key={`empty-${index}`}
                  className="invisible aspect-4/5"
                  aria-hidden="true"
                />
              ))}
            </div>

            {totalPages > 1 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-2 py-20">
            <span className="text-semitrans font-archivo text-5xl sm:text-7xl font-bold">
              0
            </span>

            <p className="text-descText2 font-montserrat text-sm font-bold tracking-widest">
              NO PRODUCTS YET
            </p>
          </div>
        )}
      </div>

      <ProductPreviewModal
        product={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
};

export default Products;