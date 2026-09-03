import React from 'react';
import { motion } from 'framer-motion';
import { EVENTS } from '@/constants';
import { MapPin, Clock, Calendar } from 'lucide-react';
import { EventDetail } from '@/types';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #2B1A2A
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

const EventCard = ({ detail, type }: { detail: EventDetail; type: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    whileHover={{ y: -8 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white p-8 sm:p-10 md:p-12 shadow-[0_15px_35px_-15px_rgba(43,26,42,0.12)] border-t-2 border-[#536332] w-full max-w-lg mx-auto md:mx-4 mb-10 md:mb-0 relative rounded-sm flex flex-col justify-between"
  >
    {/* Ícono Superior Emblema */}
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#FCFBF5] p-3 rounded-full border border-[#536332]/30 shadow-sm">
      {type === 'Ceremony' ? (
        <svg className="w-6 h-6 text-[#536332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-[#536332]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
      )}
    </div>
    
    <div>
      <h3 className="font-serif italic text-3xl text-center text-[#2B1A2A] mb-8 mt-2">{detail.title}</h3>
      
      <div className="space-y-5 font-sans text-[#2B1A2A]/80">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-[#536332] mr-4 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-sm md:text-base font-light tracking-wide">{detail.date}</span>
        </div>

        <div className="flex items-center">
          <Clock className="w-5 h-5 text-[#536332] mr-4 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-sm md:text-base font-light tracking-wide">{detail.time}</span>
        </div>

        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-[#536332] mr-4 mt-1 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-[#2B1A2A] text-base">{detail.locationName}</p>
            <p className="text-xs md:text-sm text-[#A8ABAE] font-light mt-0.5">{detail.address}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Botón Abrir Mapa */}
    <div className="mt-10 text-center">
      <a 
        href={detail.mapLink} 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block px-8 py-3 border border-[#536332] text-[#536332] hover:bg-[#536332] hover:text-[#FCFBF5] transition-all duration-500 text-xs uppercase tracking-[0.25em] font-medium rounded-full"
      >
        Ver Ubicación en Mapa
      </a>
    </div>
  </motion.div>
);

const EventDetails: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-[#FCFBF5] border-t border-b border-[#A8ABAE]/20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Encabezado */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-[#2B1A2A] mb-3">Dónde & Cuándo</h2>
          <div className="w-16 h-[1px] bg-[#536332] mx-auto mb-4"></div>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#A8ABAE]">Acompáñanos a celebrar este día especial</p>
        </motion.div>

        {/* Tarjetas de Eventos */}
        <div className="flex flex-col md:flex-row justify-center items-stretch flex-wrap gap-8 md:gap-4">
          
          {EVENTS.reception && (
            <EventCard detail={EVENTS.reception} type="Reception" />
          )}
        </div>

      </div>
    </section>
  );
};

export default EventDetails;