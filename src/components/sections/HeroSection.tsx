import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { COUPLE_NAMES, WEDDING_DATE } from '@/constants';
import { ArrowDown } from 'lucide-react';
import fotoFondo from '@/assets/gallery/herofotodrixllely.jpg';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #2B1A2A
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

const HeroSection: React.FC = () => {
  const date = new Date(WEDDING_DATE);
  const formattedDate = date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 800], [0, 200]);
  const textY = useTransform(scrollY, [0, 800], [0, -80]);
  const opacity = useTransform(scrollY, [0, 600], [1, 0]);

  return (
    <section className="relative h-screen w-full overflow-hidden flex items-center justify-center bg-[#2B1A2A]">
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img 
          src={fotoFondo} 
          alt="Wedding Background" 
          className="w-full h-[120%] object-cover opacity-75"
          loading="eager"
        />
        {/* Gradient overlay estilizado con Dark Lila */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#2B1A2A]/40 via-[#2B1A2A]/60 to-[#2B1A2A]/90" />
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

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-[#A8ABAE]/80"
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ArrowDown size={24} strokeWidth={1.5} className="text-[#536332]" />
      </motion.div>
    </section>
  );
};

export default HeroSection;