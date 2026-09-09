import React from 'react';
import { useCountdown } from '@/hooks/useCountdown';
import { WEDDING_DATE } from '@/constants';
import { motion } from 'framer-motion';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #381031
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

const TimeUnit = ({ value, label, showSeparator = true }: { value: number; label: string; showSeparator?: boolean }) => (
  <div className="flex items-center">
    <div className="flex flex-col items-center">
      <span className="font-display text-4xl sm:text-5xl md:text-7xl lg:text-[6rem] text-[#381031] leading-none tracking-tighter">
        {String(value).padStart(2, '0')}
      </span>
      <span className="font-sans text-[9px] sm:text-[10px] md:text-xs text-[#536332] tracking-[0.4em] uppercase mt-4 sm:mt-6 font-medium">
        {label}
      </span>
    </div>
    
    {showSeparator && (
      <div className="mx-3 sm:mx-6 md:mx-10 lg:mx-14 font-serif text-2xl sm:text-3xl md:text-5xl text-[#A8ABAE]/50 font-light -mt-8 sm:-mt-10">
        :
      </div>
    )}
  </div>
);

const Countdown: React.FC = () => {
  const timeLeft = useCountdown(WEDDING_DATE);

  // If the date has passed
  if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0) {
      return null;
  }

  return (
    <section className="py-24 md:py-32 px-4 bg-[#FCFBF5] flex flex-col items-center justify-center overflow-hidden border-t-[0.5px] border-b-[0.5px] border-[#A8ABAE]/20 relative">
      
      {/* Background Ornament */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] border border-[#536332]/5 rounded-full pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[100%] h-[100%] border border-[#536332]/5 rounded-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        viewport={{ once: true, margin: "-100px" }}
        className="text-center relative z-10 w-full max-w-5xl"
      >
        <div className="overflow-hidden mb-12 sm:mb-16 md:mb-20">
            <motion.h3 
              initial={{ y: 30 }}
              whileInView={{ y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="font-serif italic text-2xl sm:text-3xl md:text-4xl text-[#381031]/80 font-light"
            >
              La espera casi termina
            </motion.h3>
        </div>
        
        <div className="flex justify-center items-center gap-y-12 sm:gap-y-16">
          <TimeUnit value={timeLeft.days} label="días" />
          <TimeUnit value={timeLeft.hours} label="horas" />
          <TimeUnit value={timeLeft.minutes} label="minutos" />
          <TimeUnit value={timeLeft.seconds} label="segundos" showSeparator={false} />
        </div>
      </motion.div>
    </section>
  );
};

export default Countdown;