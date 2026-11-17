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

  const ctaClassName =
    "group inline-flex max-w-45 items-center gap-2 truncate font-montserrat text-[9px] font-bold uppercase tracking-[1.5px] text-white transition hover:text-floesky sm:max-w-none sm:gap-3 sm:text-[10px] sm:tracking-[2px] lg:text-xs";

  return (
    <div
      className="
        w-full
        max-w-7xl
        lg:max-w-[min(80rem,calc((100dvh-22rem)*21/9))]
      "
    >
      <div className="overflow-hidden border border-borderColor bg-black">
        {/* HEADER */}
        <div className="border-b border-borderColor px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-7">
          <div className="mb-3 flex items-center justify-between gap-4 sm:mb-5">
            <AnimatePresence mode="wait">
              <motion.span
                key={`eyebrow-${slide.id}`}
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
                className="min-w-0 truncate font-montserrat text-[9px] font-bold uppercase tracking-[2px] text-floesky sm:text-xs sm:tracking-[3px]"
              >
                {slide.eyebrow}
              </motion.span>
            </AnimatePresence>

            {slides.length > 1 && (
              <span className="shrink-0 font-montserrat text-[9px] font-bold tracking-[1.5px] text-white/30 sm:text-[10px] sm:tracking-[2px]">
                {String(index + 1).padStart(2, "0")}

                <span className="mx-1.5 text-white/10 sm:mx-2">/</span>

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
              className="grid gap-2 sm:gap-3 lg:grid-cols-[1fr_0.7fr] lg:items-end lg:gap-12"
            >
              <h2 className="whitespace-nowrap font-archivo text-[clamp(1.75rem,4vw,3.5rem)] font-bold leading-none tracking-tighter text-white">
                {slide.title}
              </h2>

              {slide.subtitle && (
                <p className="max-w-lg font-montserrat text-[11px] leading-5 text-white/45 sm:text-sm sm:leading-6 lg:justify-self-end">
                  {slide.subtitle}
                </p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* 21:9 LANDSCAPE IMAGE */}
        <div className="relative aspect-21/9 w-full overflow-hidden bg-[#080808]">
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
        <div className="flex min-h-14 items-center justify-between gap-3 border-t border-borderColor px-4 py-3 sm:min-h-16 sm:px-8 lg:px-10">
          {/* CTA */}
          <div className="min-w-0">
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
                  className="min-w-0"
                >
                  {isExternalLink(slide.cta_link) ? (
                    <a
                      href={slide.cta_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={ctaClassName}
                    >
                      <span className="truncate">{slide.cta_label}</span>

                      <span className="shrink-0 text-floesky transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </a>
                  ) : (
                    <Link to={slide.cta_link} className={ctaClassName}>
                      <span className="truncate">{slide.cta_label}</span>

                      <span className="shrink-0 text-floesky transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* NAVIGATION */}
          {slides.length > 1 && (
            <div className="flex shrink-0 items-center gap-3 sm:gap-5">
              {/* PROGRESS */}
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

              {/* ARROWS */}
              <div className="flex">
                <button
                  type="button"
                  onClick={() => goTo(index - 1)}
                  aria-label="Previous slide"
                  className="flex h-8 w-8 items-center justify-center border border-borderColor text-white/50 transition hover:border-white/30 hover:text-white sm:h-9 sm:w-9"
                >
                  <FaChevronLeft size={11} />
                </button>

                <button
                  type="button"
                  onClick={() => goTo(index + 1)}
                  aria-label="Next slide"
                  className="-ml-px flex h-8 w-8 items-center justify-center border border-borderColor text-white/50 transition hover:border-white/30 hover:text-white sm:h-9 sm:w-9"
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
