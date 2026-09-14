import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { FaPlay, FaExpand } from "react-icons/fa";
import type { Highlight } from "../../types/types";
import Pagination from "../common/Pagination";
import usePagination from "../../hooks/usePagination";
import { getHighlights } from "../../services/highlights.service";
import HighlightSkeleton from "../common/HighlightSkeleton";
import HighlightPreviewModal from "../common/HighlightPreviewModal";

const Highlights = () => {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<Highlight | null>(null);

  const itemsPerPage = 6;

  const {
    currentPage,
    totalPages,
    paginatedItems: currentHighlights,
    setCurrentPage,
  } = usePagination(highlights, { pageSize: itemsPerPage });

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
            ATHLETE CHRONICLES
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-white text-5xl sm:text-7xl md:text-8xl lg:text-[10rem] font-archivo tracking-tighter leading-none"
          >
            HIGHLIGHTS
          </motion.h1>
        </div>

        <div className="w-full max-w-7xl pb-28">
          <div className="relative">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                {Array.from({ length: itemsPerPage }).map((_, index) => (
                  <HighlightSkeleton key={index} />
                ))}
              </div>
            ) : error ? (
              <div className="flex min-h-80 items-center justify-center">
                <p className="font-montserrat text-xs font-bold tracking-widest text-red-400">
                  {error}
                </p>
              </div>
            ) : highlights.length === 0 ? (
              <div className="flex min-h-80 flex-col items-center justify-center gap-2">
                <span className="font-archivo text-5xl font-bold text-white/10">
                  0
                </span>

                <p className="font-montserrat text-xs font-bold tracking-widest text-white/25">
                  NO HIGHLIGHTS YET
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 w-full">
                  {currentHighlights.map((item, i) => {
                    const primaryMedia = item.media[0];

                    if (!primaryMedia) return null;

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1 * i }}
                        onClick={() => setSelected(item)}
                        className="group relative aspect-video bg-white/5 border border-borderColor overflow-hidden cursor-pointer"
                      >
                        {primaryMedia.media_type === "video" ? (
                          primaryMedia.thumbnail_url ? (
                            <img
                              src={primaryMedia.thumbnail_url}
                              alt={item.title}
                              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                            />
                          ) : (
                            <video
                              src={primaryMedia.media_url}
                              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                              muted
                              playsInline
                              preload="metadata"
                            />
                          )
                        ) : (
                          <img
                            src={primaryMedia.media_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                          />
                        )}

                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                          {primaryMedia.media_type === "video" ? (
                            <FaPlay className="w-8 h-8 sm:w-10 sm:h-10 text-descText drop-shadow-lg" />
                          ) : (
                            <FaExpand className="w-8 h-8 sm:w-10 sm:h-10 text-descText drop-shadow-lg" />
                          )}
                        </div>

                        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-linear-to-t from-black/80 to-transparent">
                          <h3 className="font-archivo text-base sm:text-lg font-bold tracking-tight">
                            {item.title}
                          </h3>

                          <p className="text-white/60 font-montserrat text-xs tracking-widest">
                            {item.athlete.toUpperCase()}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <HighlightPreviewModal
        selected={selected}
        onClose={() => setSelected(null)}
      />
    </main>
  );
};

export default Highlights;
