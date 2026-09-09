import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { COUPLE_NAMES } from '@/constants';
import { useIsDesktop } from '@/hooks';
import { DividerOrnament } from '@/components/ui/WeddingOrnaments';

// Importamos la imagen directamente desde la carpeta assets
import fotoFinalImg from '@/assets/gallery/fotofinal.webp';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #381031
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

const FinalMessage: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();
  const isVisible = useInView(sectionRef);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(
    scrollYProgress,
    [0, 1],
    isDesktop ? ['-10%', '10%'] : ['0%', '0%']
  );

  return (
    <footer ref={sectionRef} className="relative pt-24 pb-40 md:pt-32 md:pb-56 flex flex-col items-center justify-center text-[#FCFBF5] overflow-hidden text-center bg-[#381031]">
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img
          src={fotoFinalImg}
          alt=""
          aria-hidden="true"
          width={1045}
          height={1400}
          className="w-full h-[120%] object-cover opacity-60 grayscale-[10%]"
          loading="lazy"
          decoding="async"
        />
        {/* Gradient overlay - Dark Lila cinematográfico */}
        <div className="absolute top-0 left-0 w-full h-[120%] bg-gradient-to-t from-[#381031] via-[#381031]/70 to-[#381031]/40" />
      </motion.div>

      <div className="relative z-10 px-6 max-w-4xl mx-auto flex flex-col items-center">
        
        {/* Poema/Mensaje Emotivo */}
        <div className="mb-12 md:mb-16 text-[#FCFBF5]/95 leading-relaxed font-serif italic text-lg sm:text-xl md:text-3xl lg:text-4xl text-center max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="block mb-2 md:mb-4 font-light"
          >
            "Dicen que cuando encuentras a la persona correcta, el corazón lo sabe.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="block font-light"
          >
            Nosotros lo supimos y hoy queremos celebrar nuestro amor rodeados de las personas más importantes en nuestras vidas."
          </motion.span>
        </div>

        {/* Adorno Divisor */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-10 flex justify-center text-[#536332]"
        >
          <DividerOrnament className="w-24 md:w-36 drop-shadow-sm" />
        </motion.div>
        
        {/* Título "¡Los esperamos!" */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="font-sans text-[10px] sm:text-xs md:text-sm tracking-[0.4em] uppercase text-[#A8ABAE] mb-8 md:mb-10 drop-shadow-sm"
        >
          ¡Los esperamos!
        </motion.h2>

        {/* Nombres Finales Estilizados */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(3px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center -space-y-4 md:-space-y-6"
        >
          <span className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] text-[#FCFBF5] tracking-tight drop-shadow-lg leading-none">
            {COUPLE_NAMES.bride}
          </span>
          <span className="font-serif italic text-3xl sm:text-5xl md:text-6xl text-[#536332] font-light z-10 my-2">
            &
          </span>
          <span className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] text-[#FCFBF5] tracking-tight drop-shadow-lg leading-none">
            {COUPLE_NAMES.groom}
          </span>
        </motion.div>
      </div>

      {/* Footer Crédito */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        viewport={{ once: true }}
        className="absolute bottom-6 w-full text-center text-[#A8ABAE] text-xs font-sans z-10 tracking-[0.2em] uppercase font-light"
      >
        Hecho con <motion.span
          animate={isVisible ? { scale: [1, 1.25, 1] } : { scale: 1 }}
          transition={{ repeat: isVisible ? Infinity : 0, duration: 1.5, ease: "easeInOut" }}
          className="inline-block text-[#536332] mx-1"
        >♥</motion.span> para nuestra boda
      </motion.div>
    </footer>
  );
};

export default FinalMessage;