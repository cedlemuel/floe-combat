import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import type { Highlight } from "../../types/types";

type HighlightModalProps = {
  selected: Highlight | null;
  onClose: () => void;
};

const HighlightModal = ({ selected, onClose }: HighlightModalProps) => {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  useEffect(() => {
    if (!selected) {
      setIsPortrait(null);
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected, onClose]);

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
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            className={`relative w-full bg-black border border-borderColor overflow-hidden transition-all duration-300 ${
              isPortrait === null
                ? "max-w-xl"
                : isPortrait
                  ? "max-w-xs sm:max-w-sm"
                  : "max-w-lg sm:max-w-2xl lg:max-w-3xl"
            }`}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center bg-black/40 rounded-full text-white hover:text-floesky transition duration-300"
            >
              <FaTimes className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            {selected.media_type === "video" ? (
              <video
                key={selected.id}
                src={selected.media_url}
                className="w-full"
                controls
                autoPlay
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={handleVideoMetadata}
              />
            ) : (
              <img
                key={selected.id}
                src={selected.media_url}
                alt={selected.title}
                className="w-full object-contain"
                onLoad={handleImageLoad}
              />
            )}

            <div className="flex flex-col gap-1.5 sm:gap-2 p-4 sm:p-6">
              <h3 className="font-archivo text-white text-xl sm:text-2xl font-bold tracking-tight">
                {selected.title}
              </h3>

              <p className="text-descText font-montserrat text-xs tracking-widest">
                {selected.athlete.toUpperCase()}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default HighlightModal;