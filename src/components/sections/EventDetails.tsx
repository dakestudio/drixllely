import React from 'react';
import { motion } from 'framer-motion';
import { EVENTS } from '@/constants';
import { MapPin, Clock, Calendar } from 'lucide-react';
import { EventDetail } from '@/types';

// Paleta: usa los tokens wedding-lila / -pearl / -olive / -cream.
// Se definen en el bloque @theme de src/index.css (fuente unica).

const EventCard = ({ detail, type }: { detail: EventDetail; type: string }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8 }}
    whileHover={{ y: -8 }}
    whileTap={{ scale: 0.98 }}
    className="bg-white p-8 sm:p-10 md:p-12 shadow-card border-t-2 border-wedding-olive w-full max-w-lg mx-auto md:mx-4 mb-10 md:mb-0 relative rounded-sm flex flex-col justify-between"
  >
    {/* Ícono Superior Emblema */}
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-wedding-cream p-3 rounded-full border border-wedding-olive/30 shadow-sm">
      {type === 'Ceremony' ? (
        <svg className="w-6 h-6 text-wedding-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6 text-wedding-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
        </svg>
      )}
    </div>
    
    <div>
      <h3 className="font-serif italic text-3xl text-center text-wedding-lila mb-8 mt-2">{detail.title}</h3>
      
      <div className="space-y-5 font-sans text-wedding-lila/80">
        <div className="flex items-center">
          <Calendar className="w-5 h-5 text-wedding-olive mr-4 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-sm md:text-base font-light tracking-wide">{detail.date}</span>
        </div>

        <div className="flex items-center">
          <Clock className="w-5 h-5 text-wedding-olive mr-4 flex-shrink-0" strokeWidth={1.5} />
          <span className="text-sm md:text-base font-light tracking-wide">{detail.time}</span>
        </div>

        <div className="flex items-start">
          <MapPin className="w-5 h-5 text-wedding-olive mr-4 mt-1 flex-shrink-0" strokeWidth={1.5} />
          <div>
            <p className="font-medium text-wedding-lila text-base">{detail.locationName}</p>
            <p className="text-xs md:text-sm text-wedding-pearl font-light mt-0.5">{detail.address}</p>
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
        className="inline-block px-8 py-3 border border-wedding-olive text-wedding-olive hover:bg-wedding-olive hover:text-wedding-cream transition-all duration-500 text-xs uppercase tracking-[0.25em] font-medium rounded-full"
      >
        Ver Ubicación en Mapa
      </a>
    </div>
  </motion.div>
);

const EventDetails: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-wedding-cream border-t border-b border-wedding-pearl/20 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        
        {/* Encabezado Principal */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="text-center mb-16 md:mb-20"
        >
          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-wedding-lila mb-3">Dónde & Cuándo</h2>
          <div className="w-16 h-[1px] bg-wedding-olive mx-auto mb-4"></div>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-wedding-pearl">Acompáñanos a celebrar este día especial</p>
        </motion.div>

        {/* Tarjetas de Eventos */}
        <div className="flex flex-col md:flex-row justify-center items-stretch flex-wrap gap-8 md:gap-4 mb-20 md:mb-28">
          {EVENTS.reception && (
            <EventCard detail={EVENTS.reception} type="Reception" />
          )}
        </div>

        {/* --- NUEVA SECCIÓN: CÓDIGO DE VESTIMENTA --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white p-10 md:p-14 shadow-olive border border-wedding-pearl/10 max-w-4xl mx-auto rounded-sm"
        >
          <div className="flex flex-col items-center text-center">
            
            <h3 className="font-serif italic text-4xl text-wedding-lila mb-8">Código de Vestimenta</h3>
            <div className="w-12 h-[1px] bg-wedding-olive/50 mx-auto mb-10"></div>
            
            {/* INSTRUCCIONES Y SVGs DE REFERENCIA */}
            <div className="flex flex-col md:flex-row gap-12 md:gap-24 mb-12">
              
              {/* Mujeres */}
              <div className="flex flex-col items-center">
                {/* SVG Vestido */}
                <svg className="w-14 h-14 text-wedding-olive mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 4h8l1.5 5-2.5 4v8a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-8L6.5 9 8 4z" />
                  <path d="M9 13h6" />
                </svg>
                <h4 className="font-sans text-sm uppercase tracking-widest text-wedding-lila font-semibold mb-2">Mujeres</h4>
                <p className="font-sans text-sm text-wedding-lila/70">Vestido Formal</p>
              </div>

              {/* Hombres */}
              <div className="flex flex-col items-center">
                {/* SVG Traje / Moño */}
                <svg className="w-14 h-14 text-wedding-olive mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 4l3 5 4-3 4 3 3-5v15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4z" />
                  <path d="M12 9v12" />
                  <path d="M9.5 10.5l2.5-1.5 2.5 1.5" />
                  <path d="M10 11l2 2 2-2-2 6-2-6z" />
                </svg>
                <h4 className="font-sans text-sm uppercase tracking-widest text-wedding-lila font-semibold mb-2">Hombres</h4>
                <p className="font-sans text-sm text-wedding-lila/70">Traje y corbata / moño</p>
              </div>
            </div>

            {/* COLORES PROHIBIDOS */}
            <p className="font-sans text-base md:text-lg text-wedding-lila/80 max-w-2xl mb-10 leading-relaxed font-light border-t border-wedding-pearl/20 pt-10">
              Nos sentiríamos honrados si evitaran el uso de los siguientes tonos en sus atuendos el dia del evento, ya que estarán reservados exclusivamente para la corte nupcial:
            </p>

            {/* Muestras de Color Generadas con CSS (4 Columnas) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 w-full max-w-2xl">
              
              {/* Color: Dark Lila */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-wedding-lila rounded-full shadow-inner border border-wedding-pearl/20 mb-4"></div>
                <span className="font-sans text-xs uppercase tracking-widest text-wedding-lila font-medium text-center">Lila<br/>Oscuro</span>
              </div>

              {/* Color: Gris Perla */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-wedding-pearl rounded-full shadow-inner border border-wedding-pearl/20 mb-4"></div>
                <span className="font-sans text-xs uppercase tracking-widest text-wedding-lila font-medium text-center">Gris<br/>Perla</span>
              </div>

              {/* Color: Verde Olivo */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-wedding-olive rounded-full shadow-inner border border-wedding-pearl/20 mb-4"></div>
                <span className="font-sans text-xs uppercase tracking-widest text-wedding-lila font-medium text-center">Verde<br/>Olivo</span>
              </div>

              {/* Color: Blanco */}
              <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white rounded-full shadow-md border border-wedding-pearl/30 mb-4"></div>
                <span className="font-sans text-xs uppercase tracking-widest text-wedding-lila font-medium text-center">Blanco</span>
              </div>

            </div>

            <p className="font-sans text-xs text-wedding-pearl mt-12 tracking-wide">Agradecemos profundamente su comprensión.</p>
          </div>
        </motion.div>
        {/* --- FIN SECCIÓN DRESS CODE --- */}

      </div>
    </section>
  );
};

export default EventDetails;