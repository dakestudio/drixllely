import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { COUPLE_NAMES } from '@/constants';
import { DividerOrnament } from '@/components/ui/WeddingOrnaments';

const FinalMessage: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ['-10%', '10%']);

  return (
    <footer ref={sectionRef} className="relative pt-24 pb-40 md:pt-32 md:pb-56 flex flex-col items-center justify-center text-white overflow-hidden text-center bg-wedding-charcoal">
      {/* Background Image with Parallax */}
      <motion.div className="absolute inset-0 z-0" style={{ y: bgY }}>
        <img 
          src="https://images.unsplash.com/photo-1530023367847-a683933f4172?q=80&w=1920&auto=format&fit=crop" 
          alt="Wedding Celebration Sparklers" 
          className="w-full h-[120%] object-cover opacity-70 grayscale-[10%]" 
          loading="lazy"
        />
        {/* Gradient overlay - warm cinematic but slightly lighter */}
        <div className="absolute top-0 left-0 w-full h-[120%] bg-gradient-to-t from-wedding-charcoal/90 via-wedding-charcoal/70 to-wedding-charcoal/50" />
      </motion.div>

      <div className="relative z-10 px-6 max-w-4xl mx-auto flex flex-col items-center">
        
        <div className="mb-12 md:mb-16 text-wedding-beige/95 leading-loose font-serif italic text-lg sm:text-xl md:text-3xl lg:text-4xl text-center max-w-2xl">
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
            viewport={{ once: true }}
            className="block mb-2 md:mb-4"
          >
            "Dicen que cuando encuentras a la persona correcta, el corazón lo sabe. 
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            viewport={{ once: true }}
            className="block"
          >
            Nosotros lo supimos y hoy queremos celebrar nuestro amor rodeados de las personas más importantes en nuestras vidas."
          </motion.span>
        </div>

        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          whileInView={{ scaleX: 1, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7, ease: "easeOut" }}
          viewport={{ once: true }}
          className="mb-10 flex justify-center"
        >
          <DividerOrnament className="text-wedding-gold/60 w-24 md:w-36 drop-shadow-sm" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
          viewport={{ once: true }}
          className="font-sans text-[10px] sm:text-xs md:text-sm tracking-[0.4em] uppercase text-wedding-beige/70 mb-8 md:mb-10 drop-shadow-sm"
        >
          ¡Los esperamos!
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.95, filter: 'blur(3px)' }}
          whileInView={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{ duration: 1.2, delay: 1.1, ease: "easeOut" }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center -space-y-4 md:-space-y-6"
        >
          <span className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] text-wedding-gold tracking-tight drop-shadow-lg leading-none">{COUPLE_NAMES.bride}</span>
          <span className="font-serif italic text-3xl sm:text-5xl md:text-6xl text-wedding-beige/50 font-light z-10">&</span>
          <span className="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[7.5rem] text-wedding-gold tracking-tight drop-shadow-lg leading-none">{COUPLE_NAMES.groom}</span>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 1 }}
        viewport={{ once: true }}
        className="absolute bottom-6 w-full text-center text-white/90 text-sm font-sans z-10 tracking-widest font-medium drop-shadow-md"
      >
        Hecho con <motion.span 
          animate={{ scale: [1, 1.2, 1] }} 
          transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }} 
          className="inline-block text-red-500 mx-1"
        >❤️</motion.span> para nuestra boda
      </motion.div>
    </footer>
  );
};

export default FinalMessage;
