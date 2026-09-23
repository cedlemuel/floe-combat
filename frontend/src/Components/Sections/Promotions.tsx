import { useEffect, useState } from "react";

import { AnimatePresence, motion } from "framer-motion";

import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

import { Link } from "react-router-dom";

import type { PromoSlide } from "../../types/types";

const AUTO_ADVANCE_MS = 5000;

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

    const timer = setInterval(() => {
      setDirection(1);

      setIndex((current) => (current + 1) % slides.length);
    }, AUTO_ADVANCE_MS);

    return () => clearInterval(timer);
  }, [slides.length]);

  const goTo = (next: number) => {
    if (slides.length <= 1) return;

    setDirection(next > index ? 1 : -1);

    setIndex((next + slides.length) % slides.length);
  };

  const slide = slides[index];

  if (!slide) return null;

  return (
    <div className="relative w-full max-w-7xl">
      <div className="relative h-105 w-full overflow-hidden border border-borderColor sm:h-120 lg:h-140">
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={slide.id}
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
            className="absolute inset-0"
          >
            <img
              src={slide.image_url}
              alt={slide.title}
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-linear-to-t from-black via-black/50 to-transparent" />

            <div className="absolute inset-0 flex flex-col justify-end gap-2 p-6 sm:gap-3 sm:p-10 lg:p-14">
              <span className="font-montserrat text-xs font-bold tracking-widest text-floesky sm:text-sm">
                {slide.eyebrow}
              </span>

              <h2 className="font-archivo text-4xl font-bold leading-none tracking-tighter text-white sm:text-6xl lg:text-7xl">
                {slide.title}
              </h2>

              <p className="max-w-md font-montserrat text-sm text-white/60 sm:text-base">
                {slide.subtitle}
              </p>

              <Link
                to={slide.cta_link}
                className="mt-3 w-fit border border-floesky px-5 py-2.5 font-montserrat text-xs font-bold tracking-widest text-floesky transition hover:bg-floesky hover:text-black sm:mt-4"
              >
                {slide.cta_label}
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {slides.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              aria-label="Previous slide"
              className="absolute left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/40 text-white transition hover:text-floesky sm:flex"
            >
              <FaChevronLeft size={14} />
            </button>

            <button
              type="button"
              onClick={() => goTo(index + 1)}
              aria-label="Next slide"
              className="absolute right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center bg-black/40 text-white transition hover:text-floesky sm:flex"
            >
              <FaChevronRight size={14} />
            </button>
          </>
        )}
      </div>

      {slides.length > 1 && (
        <div className="flex items-center justify-center gap-2 pt-5">
          {slides.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-1.5 rounded-full transition-all ${
                i === index
                  ? "w-6 bg-floesky"
                  : "w-1.5 bg-white/20"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default PromoCarousel;