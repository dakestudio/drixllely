import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { GALLERY_IMAGES } from '@/constants';
import { X, Heart } from 'lucide-react';

// --- PALETA DE COLORES (Basada en tu imagen) ---
// Dark Lila: #2B1A2A | Gris Perla: #A8ABAE | Verde Olivo: #536332 | Blanco: #FCFBF5

const FloatingPetals = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: ['-10vh', '110vh'],
            x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 15,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * -20,
          }}
          className={`absolute rounded-full opacity-30 blur-[2px] ${
            i % 2 === 0 ? 'bg-[#536332] w-4 h-4' : 'bg-[#A8ABAE] w-6 h-6'
          }`}
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10%',
          }}
        />
      ))}
    </div>
  );
};

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const containerRef = useRef(null);

  // Efecto Parallax basado en el scroll
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  // Diferentes velocidades para el parallax (ajustadas para no marear en móvil)
  const yFast = useTransform(scrollYProgress, [0, 1], [80, -80]);
  const ySlow = useTransform(scrollYProgress, [0, 1], [40, -40]);
  const yReverse = useTransform(scrollYProgress, [0, 1], [-80, 80]);

  // Patrón de tamaños (Se apilan bonito en móvil y se expanden en PC)
  const getSpanClasses = (index: number) => {
    const patterns = [
      "md:col-span-8 md:row-span-2", 
      "md:col-span-4 md:row-span-1", 
      "md:col-span-4 md:row-span-1", 
      "md:col-span-4 md:row-span-2", 
      "md:col-span-8 md:row-span-1", 
      "md:col-span-6 md:row-span-2", 
      "md:col-span-6 md:row-span-2", 
    ];
    return patterns[index % patterns.length];
  };

  return (
    <section ref={containerRef} className="py-24 md:py-32 px-4 bg-[#FCFBF5] relative overflow-hidden">
      
      <FloatingPetals />

      {/* Palabras de amor de fondo con Parallax Inverso */}
      <motion.div style={{ y: yReverse }} className="absolute top-1/4 left-[-5%] text-[#A8ABAE] opacity-10 font-serif text-[6rem] md:text-[12rem] whitespace-nowrap pointer-events-none z-0">
        Drix & Llely
      </motion.div>
      <motion.div style={{ y: yFast }} className="absolute bottom-1/4 right-[-5%] text-[#536332] opacity-10 font-serif text-[6rem] md:text-[12rem] whitespace-nowrap pointer-events-none z-0">
        Drix & Llely
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Título */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-24"
        >
          <h2 className="font-serif italic text-5xl md:text-7xl text-[#2B1A2A] mb-4">Nuestra Historia</h2>
          <div className="flex items-center justify-center gap-4 text-[#536332]">
            <div className="w-12 h-[1px] bg-[#536332]"></div>
            <Heart size={16} className="animate-pulse" />
            <div className="w-12 h-[1px] bg-[#536332]"></div>
          </div>
        </motion.div>

        {/* Cuadrícula Dinámica Optimizada para Móvil */}
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] md:auto-rows-[300px] gap-6 md:gap-8">
          {GALLERY_IMAGES.map((img, index) => {
            const parallaxEffect = index % 2 === 0 ? ySlow : yFast;

            return (
              /* Contenedor Padre: Se encarga SOLO del Parallax constante */
              <motion.div
                key={img.id}
                style={{ y: parallaxEffect }} 
                className={`relative w-full h-full ${getSpanClasses(index)}`}
              >
                {/* Contenedor Hijo: Se encarga del Efecto de Entrada y Toque/Hover */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.85, filter: "blur(10px)", y: 40 }}
                  whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)", y: 0 }}
                  viewport={{ once: false, amount: 0.2 }} // Se repite cada vez que scrolleas
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  whileHover={{ scale: 1.02 }} // Efecto sutil para PC
                  whileTap={{ scale: 0.96 }}   // Efecto de "hundimiento" al tocar en celular
                  className="w-full h-full cursor-pointer overflow-hidden rounded-md shadow-lg group relative bg-[#A8ABAE]/10"
                  onClick={() => setSelectedImage(img.id)}
                >
                  <motion.img 
                    layoutId={`gallery-img-${img.id}`}
                    src={img.src} 
                    alt={img.alt} 
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />
                  
                  {/* Capa de color oscura solo para Desktop al pasar el mouse */}
                  <div className="absolute inset-0 bg-[#2B1A2A]/0 group-hover:bg-[#2B1A2A]/10 transition-all duration-500 hidden md:block" />
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal / Lightbox */}
      <AnimatePresence>
        {selectedImage !== null && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 bg-[#FCFBF5]/85 flex items-center justify-center p-4 sm:p-8"
            onClick={() => setSelectedImage(null)}
          >
            <button className="absolute top-6 right-6 text-[#2B1A2A] hover:text-[#536332] transition-colors z-50 p-3 bg-white/60 rounded-full backdrop-blur-md shadow-sm">
              <X size={28} />
            </button>
            
            <motion.img
              layoutId={`gallery-img-${selectedImage}`}
              src={GALLERY_IMAGES.find(img => img.id === selectedImage)?.src || ''}
              className="max-h-[85vh] max-w-[95vw] object-contain shadow-2xl rounded-md"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;