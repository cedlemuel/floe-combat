import { useEffect, useState } from "react";

import About from "../Sections/About";
import Hero from "../Sections/Hero";
import PromoCarousel from "../Sections/Promotions";
import Showcase from "../Sections/Showcase";
import Values from "../Sections/Values";

import type { PromoSlide } from "../../types/types";
import { getPromoSlides } from "../../services/promotions.service";

const LandingPage = () => {
  const [promotions, setPromotions] = useState<PromoSlide[]>([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const data = await getPromoSlides();

        setPromotions(data);
      } catch (error) {
        console.error("Could not fetch promotions:", error);
      }
    };

    fetchPromotions();
  }, []);

  return (
    <main className="bg-black">
      <section className="min-h-screen flex items-center pt-24">
        <Hero />

        <span className="absolute bottom-8 right-8 sm:right-12 font-montserrat text-[11px] font-bold tracking-[3px] text-white/30">
          SCROLL
        </span>
      </section>

      {promotions.length > 0 && (
        <section className="min-h-screen flex items-center justify-center border-y border-borderColor px-6 sm:px-10">
          <PromoCarousel slides={promotions} />
        </section>
      )}

      <section className="min-h-screen flex items-center justify-center border-y border-borderColor">
        <About />
      </section>

      <section className="min-h-screen flex items-center justify-center border-y border-borderColor">
        <Values />
      </section>

      <section className="min-h-screen flex items-center justify-center border-y border-borderColor">
        <Showcase />
      </section>
    </main>
  );
};

export default LandingPage;
