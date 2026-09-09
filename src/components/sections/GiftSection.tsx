import React from 'react';
import { motion } from 'framer-motion';
import { Gift } from 'lucide-react';

// Paleta: usa los tokens wedding-lila / -pearl / -olive / -cream.
// Se definen en el bloque @theme de src/index.css (fuente unica).

const GiftSection: React.FC = () => {
  return (
    <section className="py-24 md:py-32 bg-wedding-cream border-t border-b border-wedding-pearl/20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Ícono Principal */}
          <div className="w-16 h-16 rounded-full bg-white border border-wedding-olive/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Gift className="w-8 h-8 text-wedding-olive" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-wedding-lila mb-4">
            Mesa de Regalos
          </h2>
          <div className="w-16 h-[1px] bg-wedding-olive mx-auto mb-6"></div>

          <p className="font-sans text-sm md:text-base text-wedding-lila/80 mb-12 max-w-xl mx-auto leading-relaxed font-light">
            Su presencia es nuestro mejor regalo. Sin embargo, si desean tener un detalle con nosotros,
            hemos preparado esta opción para nuestra luna de miel y nuevo hogar.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">

            {/* Tarjeta Liverpool */}
            <motion.a
              href="https://mesaderegalos.liverpool.com.mx/milistaderegalos/52023058?category=154"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -6 }}
              whileTap={{ scale: 0.97 }}
              className="flex flex-col items-center justify-center p-8 bg-white border border-wedding-pearl/30 hover:border-wedding-olive transition-all duration-500 shadow-card-soft group w-full sm:w-72 rounded-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-wedding-olive focus-visible:ring-offset-2"
            >
              <span className="font-serif italic text-2xl mb-2 text-wedding-lila">Liverpool</span>
              <span className="text-xs font-sans text-wedding-pearl uppercase tracking-[0.25em] group-hover:text-wedding-olive transition-colors font-medium">
                Ver Lista de Regalos
              </span>
            </motion.a>

          </div>

        </motion.div>
      </div>
    </section>
  );
};

export default GiftSection;
