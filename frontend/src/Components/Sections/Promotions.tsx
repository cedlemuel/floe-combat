import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from "react-router-dom";

import type { PromoSlide } from "../../types/types";

const AUTO_ADVANCE_MS = 10000;

const isExternalLink = (url: string) => /^https?:\/\//i.test(url);

type PromoCarouselProps = {
  slides: PromoSlide[];
};

const PromoCarousel = ({ slides }: PromoCarouselProps) => {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);

  useEffect(() => {
    setIndex(0);
  }, [slides.length]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const timer = setTimeout(() => {
      setDirection(1);
      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);

    return () => clearTimeout(timer);
  }, [index, slides.length]);

  const goTo = (next: number) => {
    if (slides.length <= 1) return;

    setDirection(next > index ? 1 : -1);
    setIndex((next + slides.length) % slides.length);
  };

  const slide = slides[index];

  if (!slide) return null;

  return (
    <div className="w-full max-w-7xl">
      <div className="overflow-hidden border border-borderColor bg-black">
        {/* HEADER */}
        <div className="border-b border-borderColor px-5 py-6 sm:px-8 sm:py-8 lg:px-12 lg:py-10">
          <div className="mb-5 flex items-center justify-between sm:mb-7">
            <AnimatePresence mode="wait">
              <motion.span
                key={`eyebrow-${slide.id}`}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="font-montserrat text-[10px] font-bold uppercase tracking-[3px] text-floesky sm:text-xs"
              >
                {slide.eyebrow}
              </motion.span>
            </AnimatePresence>

            {slides.length > 1 && (
              <span className="font-montserrat text-[10px] font-bold tracking-[2px] text-white/30">
                {String(index + 1).padStart(2, "0")}
                <span className="mx-2 text-white/10">/</span>
                {String(slides.length).padStart(2, "0")}
              </span>
            )}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={`content-${slide.id}`}
              initial={{
                opacity: 0,
                y: 10,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                y: -10,
              }}
              transition={{
                duration: 0.35,
                ease: "easeOut",
              }}
              className="grid gap-4 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-16"
            >
              <h2 className="whitespace-nowrap font-archivo text-4xl font-bold leading-none tracking-tighter text-white sm:text-5xl lg:text-6xl">
                {slide.title}
              </h2>

              {slide.subtitle && (
                <p className="max-w-lg font-montserrat text-xs leading-6 text-white/45 sm:text-sm lg:justify-self-end">
                  {slide.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* STATIC IMAGE SHELL */}
        <div className="relative h-128 overflow-hidden bg-[#080808]">
          <AnimatePresence initial={false} custom={direction} mode="sync">
            <motion.img
              key={slide.id}
              src={slide.image_url}
              alt={slide.title}
              custom={direction}
              initial={{
                opacity: 0,
                x: direction > 0 ? 40 : -40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              exit={{
                opacity: 0,
                x: direction > 0 ? -40 : 40,
              }}
              transition={{
                duration: 0.5,
                ease: "easeOut",
              }}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </AnimatePresence>
        </div>

        {/* FOOTER */}
        <div className="flex min-h-18 items-center justify-between gap-4 border-t border-borderColor px-5 py-4 sm:px-8 lg:px-12">
          <div>
            <AnimatePresence mode="wait">
              {slide.cta_label && slide.cta_link && (
                <motion.div
                  key={`cta-${slide.id}`}
                  initial={{
                    opacity: 0,
                    y: 6,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: -6,
                  }}
                  transition={{
                    duration: 0.3,
                    ease: "easeOut",
                  }}
                >
                  {isExternalLink(slide.cta_link) ? (
                    <a
                      href={slide.cta_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-3 font-montserrat text-[10px] font-bold uppercase tracking-[2px] text-white transition hover:text-floesky sm:text-xs"
                    >
                      {slide.cta_label}

                      <span className="text-floesky transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </a>
                  ) : (
                    <Link
                      to={slide.cta_link}
                      className="group inline-flex items-center gap-3 font-montserrat text-[10px] font-bold uppercase tracking-[2px] text-white transition hover:text-floesky sm:text-xs"
                    >
                      {slide.cta_label}

                      <span className="text-floesky transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {slides.length > 1 && (
            <div className="flex items-center gap-5">
              <div className="hidden items-center gap-1.5 sm:flex">
                {slides.map((item, i) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => goTo(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-0.5 transition-all duration-300 ${
                      i === index
                        ? "w-8 bg-floesky"
                        : "w-4 bg-white/15 hover:bg-white/35"
                    }`}
                  />
                ))}
              </div>

              <div className="flex">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous slide"
                  className="flex h-9 w-9 items-center justify-center border border-borderColor text-white/50 transition hover:border-white/30 hover:text-white sm:h-10 sm:w-10"
                >
                  <FaChevronLeft size={11} />
                </button>

                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next slide"
                  className="-ml-px flex h-9 w-9 items-center justify-center border border-borderColor text-white/50 transition hover:border-white/30 hover:text-white sm:h-10 sm:w-10"
                >
                  <FaChevronRight size={11} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromoCarousel;
