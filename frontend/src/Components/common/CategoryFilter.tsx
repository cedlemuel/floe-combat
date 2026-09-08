import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { FiChevronDown } from "react-icons/fi";
import FilterButton from "./FilterButton";
import type { CategoryFilterProps } from "../../types/props";

const CategoryFilter = ({
  option,
  isActive,
  activeSubcategory,
  onSelectCategory,
  onSelectSubcategory,
  delay = 0,
}: CategoryFilterProps) => {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const hasSubs = !!option.subcategories?.length;

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={wrapperRef} className="relative">
      <FilterButton
        label={option.label}
        isActive={isActive}
        delay={delay}
        icon={
          hasSubs ? (
            <FiChevronDown
              size={12}
              className={`transition-transform duration-300 ${
                open ? "rotate-180" : ""
              }`}
            />
          ) : undefined
        }
        onClick={() => {
          if (hasSubs) {
            setOpen((prev) => !prev);
          } else {
            onSelectCategory(option.value);
          }
        }}
      />

      <AnimatePresence>
        {hasSubs && open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 top-full mt-2 flex flex-col min-w-40 bg-black border border-borderColor z-20"
          >
            <button
              onClick={() => {
                onSelectCategory(option.value);
                setOpen(false);
              }}
              className={`text-left font-montserrat text-xs font-bold px-4 py-2.5 tracking-widest transition ${
                isActive && !activeSubcategory
                  ? "text-floesky"
                  : "text-white/60 hover:text-floesky"
              }`}
            >
              ALL {option.label}
            </button>

            {option.subcategories!.map((sub) => (
              <button
                key={sub}
                onClick={() => {
                  onSelectSubcategory(sub);
                  setOpen(false);
                }}
                className={`text-left font-montserrat text-xs font-bold px-4 py-2.5 tracking-widest border-t border-borderColor/60 transition ${
                  activeSubcategory === sub
                    ? "text-floesky"
                    : "text-white/60 hover:text-floesky"
                }`}
              >
                {sub}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoryFilter;
