import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWedding } from '@/context';
import { COUPLE_NAMES, WEDDING_DATE } from '@/constants';
import FloatingParticles from '@/components/ui/FloatingParticles';
import { CornerOrnament } from '@/components/ui/WeddingOrnaments';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #381031
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

const WEDDING_DATE_LABEL = new Date(WEDDING_DATE).toLocaleDateString('es-MX', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'America/Mexico_City',
});

const WelcomeScreen: React.FC = () => {
  const { isEntered, enterSite } = useWedding();

  return (
    <AnimatePresence>
      {!isEntered && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0, 
            scale: 1.08,
            filter: 'blur(20px)',
            transition: { duration: 1.6, ease: [0.76, 0, 0.24, 1] } 
          }}
          /* El scroll ya lo bloquea WeddingProvider fijando el <body>.
             Un onTouchMove con preventDefault aquí no haría nada: React
             registra touchmove como listener pasivo. */
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-[#FCFBF5]"
        >
          {/* Sombra sutil de fondo en los bordes para dar profundidad */}
          <div className="absolute inset-0 bg-radial-[at_center] from-transparent to-[#381031]/5 pointer-events-none" />

          {/* Partículas Flotantes */}
          <div className="absolute inset-0 opacity-30 pointer-events-none">
             <FloatingParticles />
          </div>

          {/* Marco Fino Minimalista con tus Ornametos */}
          <div className="absolute inset-0 p-4 sm:p-8 pointer-events-none opacity-40">
            <div className="w-full h-full border-[0.5px] border-[#A8ABAE] relative">
               <div className="absolute top-0 left-0 text-[#536332]"><CornerOrnament /></div>
               <div className="absolute top-0 right-0 rotate-90 text-[#536332]"><CornerOrnament /></div>
               <div className="absolute bottom-0 left-0 -rotate-90 text-[#536332]"><CornerOrnament /></div>
               <div className="absolute bottom-0 right-0 rotate-180 text-[#536332]"><CornerOrnament /></div>
            </div>
          </div>

          <div className="w-full max-w-7xl px-6 md:px-12 relative z-10 flex flex-col items-center justify-center h-full">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-center flex flex-col items-center w-full"
            >
              {/* Encabezado */}
              <div className="overflow-hidden mb-6">
                <motion.p 
                  initial={{ y: 40, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4, duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                  className="font-sans text-[10px] sm:text-xs tracking-[0.5em] uppercase text-[#A8ABAE] font-light"
                >
                  Estás invitado a celebrar
                </motion.p>
              </div>

              {/* Nombres Principales en Dark Lila y Ampersand en Verde Olivo */}
              <div className="relative flex flex-col items-center justify-center my-6 sm:my-10 w-full select-none">
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] text-[#381031] leading-[0.8] tracking-tight relative z-20 text-center"
                >
                  {COUPLE_NAMES.bride.toUpperCase()}
                </motion.h1>

                {/* Símbolo "&" estilizado */}
                <motion.span 
                  initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ delay: 1.2, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-serif italic text-6xl sm:text-8xl md:text-[10rem] lg:text-[14rem] text-[#536332]/40 z-10 font-light pointer-events-none"
                >
                  &
                </motion.span>

                <motion.h1 
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.0, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] text-[#381031] leading-[0.8] tracking-tight relative z-20 mt-4 sm:mt-8 text-center"
                >
                  {COUPLE_NAMES.groom.toUpperCase()}
                </motion.h1>

              </div>

              {/* Fecha de la Boda */}
              <div className="overflow-hidden mt-4 mb-12">
                <motion.p
                  initial={{ y: 30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1.5, duration: 1.2, ease: [0.33, 1, 0.68, 1] }}
                  className="font-serif italic text-xl md:text-2xl text-[#381031]/80 tracking-wide capitalize"
                >
                  {WEDDING_DATE_LABEL}
                </motion.p>
              </div>

              {/* Botón de Entrada (Verde Olivo con pulso) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.9, duration: 1 }}
                className="mt-4"
              >
                <button
                  type="button"
                  onClick={enterSite}
                  aria-label="Descubrir invitación"
                  className="group relative flex items-center justify-center h-28 w-28 sm:h-36 sm:w-36 rounded-full border border-[#536332]/40 hover:border-[#536332] transition-colors duration-700 overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[#536332] focus-visible:ring-offset-4 focus-visible:ring-offset-[#FCFBF5]"
                >
                  {/* Animación de pulso continuo */}
                  <motion.div 
                    animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.25, 0.1] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute inset-0 bg-[#536332] rounded-full pointer-events-none"
                  />

                  {/* Relleno al hacer Hover */}
                  <div className="absolute inset-0 bg-[#536332] transform scale-0 group-hover:scale-100 transition-transform duration-700 ease-[0.33,1,0.68,1] rounded-full" />
                  
                  <span className="relative z-10 font-sans text-[9px] sm:text-[10px] lg:text-xs tracking-[0.25em] uppercase text-[#536332] group-hover:text-[#FCFBF5] transition-colors duration-500 w-full text-center px-2 font-medium">
                    Descubrir<br/>Invitación
                  </span>
                </button>
              </motion.div>

            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeScreen;