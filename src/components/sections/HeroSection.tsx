import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { COUPLE_NAMES, WEDDING_DATE } from '@/constants';
import { useIsDesktop } from '@/hooks';
import { ArrowDown } from 'lucide-react';
import fotoFondo from '@/assets/gallery/herofotodrixllely.webp';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #381031
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

// Relación de aspecto de la foto de portada. Reservar la caja antes de que el
// archivo llegue evita el salto de layout (CLS) al cargar.
const HERO_WIDTH = 1920;
const HERO_HEIGHT = 1072;

const HeroSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();
  const isVisible = useInView(sectionRef);

  const date = new Date(WEDDING_DATE);
  const formattedDate = date.toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'America/Mexico_City',
  });

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], isDesktop ? [0, 200] : [0, 0]);
  const textY = useTransform(scrollY, [0, 800], isDesktop ? [0, -80] : [0, 0]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section
      ref={sectionRef}
      /* 100svh en lugar de 100vh: en Safari iOS `vh` incluye la barra de
         direcciones, así que la flecha quedaba tapada y la sección saltaba
         al colapsarse la barra. */
      className="relative h-[100svh] w-full overflow-hidden flex items-center justify-center bg-[#381031]"
    >
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img
          src={fotoFondo}
          alt=""
          aria-hidden="true"
          width={HERO_WIDTH}
          height={HERO_HEIGHT}
          className="w-full h-[120%] object-cover opacity-75"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        {/* Gradient overlay estilizado con Dark Lila */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#381031]/40 via-[#381031]/60 to-[#381031]/90" />
      </motion.div>

      {/* Content with parallax */}
      <motion.div className="relative z-10 text-center text-[#FCFBF5] px-4" style={{ y: textY, opacity }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: '0.2em' }}
            animate={{ opacity: 1, letterSpacing: '0.5em' }}
            transition={{ duration: 2, delay: 0.3 }}
            className="font-serif italic text-lg md:text-2xl mb-6 text-[#A8ABAE]"
          >
            Nos Casamos
          </motion.p>

          <h1 className="font-display text-4xl sm:text-6xl md:text-8xl lg:text-9xl mb-6 tracking-wide">
            <motion.span
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-[#FCFBF5]"
            >
              {COUPLE_NAMES.bride}
            </motion.span>
            <br className="md:hidden"/>
            <motion.span
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
              className="text-2xl sm:text-3xl md:text-5xl font-serif italic text-[#536332] align-middle mx-2 sm:mx-4 inline-block"
            >
              &
            </motion.span>
            <br className="md:hidden"/>
            <motion.span
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="text-[#FCFBF5]"
            >
              {COUPLE_NAMES.groom}
            </motion.span>
          </h1>

          <motion.div
            initial={{ width: 0 }}
            animate={{ width: '6rem' }}
            transition={{ duration: 1, delay: 1.2 }}
            className="h-px bg-[#536332] mx-auto mb-6 opacity-80"
          />

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="font-sans text-base md:text-xl tracking-[0.3em] uppercase text-[#A8ABAE] font-light"
          >
            {formattedDate}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator — se detiene cuando el hero sale de pantalla */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[#A8ABAE]/80"
        animate={isVisible ? { y: [0, 8, 0] } : { y: 0 }}
        transition={{ duration: 2, repeat: isVisible ? Infinity : 0, ease: "easeInOut" }}
        aria-hidden="true"
      >
        <ArrowDown size={24} strokeWidth={1.5} className="text-[#536332]" />
      </motion.div>
    </section>
  );
};

export default HeroSection;
