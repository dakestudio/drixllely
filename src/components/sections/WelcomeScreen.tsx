import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWedding } from '@/context';
import { COUPLE_NAMES } from '@/constants';
import GoldenParticles from '@/components/ui/GoldenParticles';
import { CornerOrnament } from '@/components/ui/WeddingOrnaments';

const WelcomeScreen: React.FC = () => {
  const { isEntered, enterSite } = useWedding();

  return (
    <AnimatePresence>
      {!isEntered && (
        <motion.div
            initial={{ opacity: 1 }}
            exit={{ 
              opacity: 0, 
              y: '-100vh',
              transition: { duration: 1.4, ease: [0.76, 0, 0.24, 1] } 
            }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-wedding-beige bg-noise"
            onTouchMove={(e) => e.preventDefault()}
        >
          {/* Subtle vignette/gradient */}
          <div className="absolute inset-0 bg-radial-[at_center] from-transparent to-wedding-charcoal/5" />

          {/* Golden Floating Particles */}
          <div className="absolute inset-0 opacity-40">
             <GoldenParticles />
          </div>

          {/* Minimal Frame */}
          <div className="absolute inset-0 p-4 sm:p-8 pointer-events-none opacity-60">
            <div className="w-full h-full border-[0.5px] border-wedding-olive/30 relative">
               <div className="absolute top-0 left-0"><CornerOrnament /></div>
               <div className="absolute top-0 right-0 rotate-90"><CornerOrnament /></div>
               <div className="absolute bottom-0 left-0 -rotate-90"><CornerOrnament /></div>
               <div className="absolute bottom-0 right-0 rotate-180"><CornerOrnament /></div>
            </div>
          </div>

          <div className="w-full max-w-7xl px-6 md:px-12 relative z-10 flex flex-col items-center justify-center h-full">
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
              animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              className="text-center flex flex-col items-center w-full"
            >
              <div className="overflow-hidden mb-6">
                <motion.p 
                  initial={{ y: 50 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 0.5, duration: 1, ease: [0.33, 1, 0.68, 1] }}
                  className="font-sans text-[10px] sm:text-xs tracking-[0.5em] uppercase text-wedding-charcoal/50 font-light"
                >
                  Estás invitado a celebrar
                </motion.p>
              </div>

              {/* Editorial Typography Container */}
              <div className="relative flex flex-col items-center justify-center my-8 sm:my-12 w-full select-none">
                
                <motion.h1 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] text-wedding-charcoal leading-[0.8] tracking-tight relative z-20 text-center"
                >
                  {COUPLE_NAMES.bride.toUpperCase()}
                </motion.h1>

                <motion.span 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.4, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-serif italic text-6xl sm:text-8xl md:text-[10rem] lg:text-[14rem] text-wedding-gold/60 z-10 font-light mix-blend-multiply"
                >
                  &
                </motion.span>

                <motion.h1 
                  initial={{ opacity: 0, y: -30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                  className="font-display text-6xl sm:text-8xl md:text-9xl lg:text-[11rem] text-wedding-charcoal leading-[0.8] tracking-tight relative z-20 mt-4 sm:mt-8 text-center"
                >
                  {COUPLE_NAMES.groom.toUpperCase()}
                </motion.h1>

              </div>

              <div className="overflow-hidden mt-6 mb-16">
                <motion.p
                  initial={{ y: -50 }}
                  animate={{ y: 0 }}
                  transition={{ delay: 1.6, duration: 1, ease: [0.33, 1, 0.68, 1] }}
                  className="font-serif italic text-xl md:text-2xl text-wedding-charcoal/80 tracking-wide"
                >
                  18 de Diciembre, 2026
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.2, duration: 1 }}
                className="mt-8"
              >
                <button
                  onClick={enterSite}
                  className="group relative flex items-center justify-center h-28 w-28 sm:h-40 sm:w-40 rounded-full border-[0.5px] border-wedding-olive/40 hover:border-wedding-olive transition-colors duration-700 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-wedding-olive/5 transform scale-0 group-hover:scale-100 transition-transform duration-700 ease-[0.33,1,0.68,1] rounded-full" />
                  <span className="relative z-10 font-sans text-[9px] sm:text-[10px] lg:text-xs tracking-[0.2em] uppercase text-wedding-olive group-hover:text-wedding-charcoal transition-colors duration-500 w-full text-center px-2">
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
