import React from 'react';
import { motion } from 'framer-motion';
import { EVENTS } from '@/constants';
import { MapPin, Clock, Calendar } from 'lucide-react';
import { EventDetail } from '@/types';

const EventCard = ({ detail, type }: { detail: EventDetail, type: string }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white p-6 sm:p-8 md:p-12 shadow-lg border-t-4 border-wedding-gold w-full md:w-5/12 mx-0 md:mx-4 mb-8 md:mb-0 relative"
  >
    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-wedding-beige p-3 rounded-full border border-wedding-gold/30">
        {type === 'Ceremony' ? (
             <svg className="w-8 h-8 text-wedding-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m8-2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        ) : (
             <svg className="w-8 h-8 text-wedding-olive" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" /></svg>
        )}
    </div>
    
    <h3 className="font-display text-2xl text-center text-wedding-charcoal mb-8 mt-4">{detail.title}</h3>
    
    <div className="space-y-4 font-sans text-gray-600">
      <div className="flex items-start">
        <Calendar className="w-5 h-5 text-wedding-gold mr-3 mt-1 flex-shrink-0" />
        <span>{detail.date}</span>
      </div>
      <div className="flex items-start">
        <Clock className="w-5 h-5 text-wedding-gold mr-3 mt-1 flex-shrink-0" />
        <span>{detail.time}</span>
      </div>
      <div className="flex items-start">
        <MapPin className="w-5 h-5 text-wedding-gold mr-3 mt-1 flex-shrink-0" />
        <div>
            <p className="font-semibold">{detail.locationName}</p>
            <p className="text-sm">{detail.address}</p>
        </div>
      </div>
    </div>

    <div className="mt-8 text-center">
        <a 
            href={detail.mapLink} 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block px-6 py-2 border border-wedding-olive text-wedding-olive hover:bg-wedding-olive hover:text-white transition-colors duration-300 text-sm uppercase tracking-widest"
        >
            Ver Mapa
        </a>
    </div>
  </motion.div>
);

const EventDetails: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-wedding-beige">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-wedding-charcoal mb-4">Detalles del Evento</h2>
          <p className="font-serif italic text-gray-500">Acompañanos a celebrar</p>
        </motion.div>

        <div className="flex flex-col md:flex-row justify-center items-stretch flex-wrap">
          
          <EventCard detail={EVENTS.reception} type="Reception" />
        </div>

        <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="mt-16 text-center max-w-2xl mx-auto"
        >
            
        </motion.div>
      </div>
    </section>
  );
};

export default EventDetails;
