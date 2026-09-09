import React, { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useInView, type MotionValue } from 'framer-motion';
import { GALLERY_IMAGES } from '@/constants';
import { useIsDesktop } from '@/hooks';
import { X, Heart } from 'lucide-react';

// --- PALETA DE COLORES (Basada en tu imagen) ---
// Dark Lila: #381031 | Gris Perla: #A8ABAE | Verde Olivo: #536332 | Blanco: #FCFBF5

const PETAL_COUNT = 6;

const FloatingPetals: React.FC = () => {
  // Randomised once per mount: recomputing on every render restarted every
  // petal each time the lightbox opened or closed.
  const petals = useMemo(
    () =>
      Array.from({ length: PETAL_COUNT }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        driftFrom: Math.random() * 100 - 50,
        driftTo: Math.random() * 100 - 50,
        duration: Math.random() * 10 + 15,
        delay: Math.random() * -20,
        big: i % 2 !== 0,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {petals.map(p => (
        <motion.div
          key={p.id}
          animate={{ y: ['-10vh', '110vh'], x: [p.driftFrom, p.driftTo], rotate: [0, 360] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
          className={`absolute rounded-full opacity-30 blur-[2px] ${
            p.big ? 'bg-[#A8ABAE] w-6 h-6' : 'bg-[#536332] w-4 h-4'
          }`}
          style={{ left: p.left, top: '-10%' }}
        />
      ))}
    </div>
  );
};

const Gallery: React.FC = () => {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const containerRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();

  // Decorative motion is suspended while the section is off-screen so it stops
  // burning GPU time (and battery) when nobody is looking at it.
  const isSectionVisible = useInView(containerRef, { margin: '200px' });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  });

  // Parallax is a pointer-device treat: on touch screens the inertial scroll
  // makes these transforms stutter and the effect barely reads.
  const range = (amount: number): [number, number] =>
    isDesktop ? [amount, -amount] : [0, 0];
  const yFast = useTransform(scrollYProgress, [0, 1], range(80));
  const ySlow = useTransform(scrollYProgress, [0, 1], range(40));
  const yReverse = useTransform(scrollYProgress, [0, 1], range(-80));

  const closeLightbox = useCallback(() => setSelectedImage(null), []);

  // Lock the page behind the lightbox and wire up Escape.
  useEffect(() => {
    if (selectedImage === null) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selectedImage, closeLightbox]);

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

  const selected = GALLERY_IMAGES.find(img => img.id === selectedImage);

  return (
    <section ref={containerRef} className="py-24 md:py-32 px-4 bg-[#FCFBF5] relative overflow-hidden">

      {isDesktop && isSectionVisible && <FloatingPetals />}

      {/* Palabras de amor de fondo con Parallax Inverso */}
      <motion.div
        style={{ y: yReverse }}
        aria-hidden="true"
        className="absolute top-1/4 left-[-5%] text-[#A8ABAE] opacity-10 font-serif text-[6rem] md:text-[12rem] whitespace-nowrap pointer-events-none z-0 select-none"
      >
        Drix &amp; Llely
      </motion.div>
      <motion.div
        style={{ y: yFast }}
        aria-hidden="true"
        className="absolute bottom-1/4 right-[-5%] text-[#536332] opacity-10 font-serif text-[6rem] md:text-[12rem] whitespace-nowrap pointer-events-none z-0 select-none"
      >
        Drix &amp; Llely
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
          <h2 className="font-serif italic text-5xl md:text-7xl text-[#381031] mb-4">Nuestra Historia</h2>
          <div className="flex items-center justify-center gap-4 text-[#536332]">
            <div className="w-12 h-[1px] bg-[#536332]"></div>
            <Heart size={16} className={isSectionVisible ? 'animate-pulse' : undefined} />
            <div className="w-12 h-[1px] bg-[#536332]"></div>
          </div>
        </motion.div>

        {/* Cuadrícula Dinámica Optimizada para Móvil */}
        <div className="grid grid-cols-1 md:grid-cols-12 auto-rows-[300px] gap-6 md:gap-8">
          {GALLERY_IMAGES.map((img, index) => {
            const parallaxEffect: MotionValue<number> = index % 2 === 0 ? ySlow : yFast;

            return (
              /* Contenedor Padre: Se encarga SOLO del Parallax constante */
              <motion.div
                key={img.id}
                style={{ y: parallaxEffect }}
                className={`relative w-full h-full ${getSpanClasses(index)}`}
              >
                {/* Contenedor Hijo: Efecto de entrada y toque/hover.
                    Sin `filter: blur` animado — obliga al navegador a
                    re-rasterizar la imagen entera en cada frame — y con
                    `once: true` para que no se repita en cada scroll. */}
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.92, y: 40 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSelectedImage(img.id)}
                  aria-label={`Ampliar ${img.alt}`}
                  className="w-full h-full block cursor-pointer overflow-hidden rounded-md shadow-lg group relative bg-[#A8ABAE]/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536332] focus-visible:ring-offset-2"
                >
                  <motion.img
                    layoutId={`gallery-img-${img.id}`}
                    src={img.src}
                    alt={img.alt}
                    width={img.width}
                    height={img.height}
                    loading={index < 2 ? 'eager' : 'lazy'}
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />

                  {/* Capa de color oscura solo para Desktop al pasar el mouse */}
                  <div className="absolute inset-0 bg-[#381031]/0 group-hover:bg-[#381031]/10 transition-all duration-500 hidden md:block" />
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Modal / Lightbox */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={selected.alt}
            /* backdrop-blur estático: animarlo cuesta un repaint de pantalla
               completa por frame y en móvil se ve como un tirón. */
            className="fixed inset-0 z-50 bg-[#FCFBF5]/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
            onClick={closeLightbox}
          >
            <button
              type="button"
              onClick={closeLightbox}
              aria-label="Cerrar imagen"
              className="absolute top-6 right-6 text-[#381031] hover:text-[#536332] transition-colors z-50 p-3 bg-white/60 rounded-full shadow-sm"
            >
              <X size={28} />
            </button>

            <motion.img
              layoutId={`gallery-img-${selected.id}`}
              src={selected.src}
              alt={selected.alt}
              className="max-h-[85vh] max-w-[95vw] object-contain shadow-2xl rounded-md"
              onClick={e => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

export default Gallery;
