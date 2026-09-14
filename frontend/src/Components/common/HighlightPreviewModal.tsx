import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaTimes,
} from "react-icons/fa";

import type { HighlightPreviewModalProps } from "../../types/props";

const HighlightPreviewModal = ({
  selected,
  onClose,
}: HighlightPreviewModalProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  const currentMedia = selected?.media?.[currentIndex];

  useEffect(() => {
    setCurrentIndex(0);
    setIsPortrait(null);
  }, [selected?.id]);

  useEffect(() => {
    if (!selected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }

      if (selected.media.length <= 1) return;

      if (e.key === "ArrowLeft") {
        setCurrentIndex((prev) =>
          prev === 0 ? selected.media.length - 1 : prev - 1,
        );

        setIsPortrait(null);
      }

      if (e.key === "ArrowRight") {
        setCurrentIndex((prev) =>
          prev === selected.media.length - 1 ? 0 : prev + 1,
        );

        setIsPortrait(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, onClose]);

  const goPrevious = () => {
    if (!selected || selected.media.length <= 1) return;

    setCurrentIndex((prev) =>
      prev === 0 ? selected.media.length - 1 : prev - 1,
    );

    setIsPortrait(null);
  };

  const goNext = () => {
    if (!selected || selected.media.length <= 1) return;

    setCurrentIndex((prev) =>
      prev === selected.media.length - 1 ? 0 : prev + 1,
    );

    setIsPortrait(null);
  };

  const handleVideoMetadata = (
    e: React.SyntheticEvent<HTMLVideoElement>,
  ) => {
    const video = e.currentTarget;

    setIsPortrait(video.videoHeight > video.videoWidth);
  };

  const handleImageLoad = (
    e: React.SyntheticEvent<HTMLImageElement>,
  ) => {
    const image = e.currentTarget;

    setIsPortrait(image.naturalHeight > image.naturalWidth);
  };

  return (
    <AnimatePresence>
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4 sm:p-6"
        >
          <motion.div
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
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full overflow-hidden border border-borderColor bg-black transition-all duration-300 ${
              isPortrait === null
                ? "max-w-2xl"
                : isPortrait
                  ? "max-w-xs sm:max-w-sm"
                  : "max-w-lg sm:max-w-2xl lg:max-w-3xl"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:text-floesky sm:right-4 sm:top-4 sm:h-10 sm:w-10"
            >
              <FaTimes className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </button>

            {currentMedia ? (
              <div className="relative flex min-h-60 items-center justify-center bg-black">
                {currentMedia.media_type === "video" ? (
                  <video
                    key={currentMedia.id}
                    src={currentMedia.media_url}
                    className="max-h-[75vh] w-full object-contain"
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    onLoadedMetadata={handleVideoMetadata}
                  />
                ) : (
                  <img
                    key={currentMedia.id}
                    src={currentMedia.media_url}
                    alt={selected.title}
                    className="max-h-[75vh] w-full object-contain"
                    onLoad={handleImageLoad}
                  />
                )}

                {selected.media.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrevious}
                      aria-label="Previous media"
                      className="absolute left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 hover:text-floesky"
                    >
                      <FaChevronLeft size={14} />
                    </button>

                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Next media"
                      className="absolute right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80 hover:text-floesky"
                    >
                      <FaChevronRight size={14} />
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="flex min-h-60 items-center justify-center">
                <p className="font-montserrat text-xs text-descText">
                  NO MEDIA AVAILABLE
                </p>
              </div>
            )}

            <div className="flex flex-col gap-1.5 p-4 sm:gap-2 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h3 className="truncate font-archivo text-xl font-bold tracking-tight text-white sm:text-2xl">
                    {selected.title}
                  </h3>

                  <p className="font-montserrat text-xs tracking-widest text-descText">
                    {selected.athlete.toUpperCase()}
                  </p>
                </div>

                {selected.media.length > 1 && (
                  <span className="shrink-0 font-montserrat text-[10px] tracking-wider text-descText">
                    {currentIndex + 1} / {selected.media.length}
                  </span>
                )}
              </div>

              {selected.media.length > 1 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {selected.media.map((media, index) => (
                    <button
                      key={media.id}
                      type="button"
                      onClick={() => {
                        setCurrentIndex(index);
                        setIsPortrait(null);
                      }}
                      aria-label={`View media ${index + 1}`}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden border transition ${
                        index === currentIndex
                          ? "border-floesky"
                          : "border-borderColor opacity-60 hover:opacity-100"
                      }`}
                    >
                      {media.media_type === "video" ? (
                        media.thumbnail_url ? (
                          <img
                            src={media.thumbnail_url}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <video
                            src={media.media_url}
                            className="h-full w-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                          />
                        )
                      ) : (
                        <img
                          src={media.media_url}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HighlightPreviewModal;