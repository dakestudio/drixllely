import React from 'react';
import { motion } from 'framer-motion';
import { Gift, CreditCard, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #2B1A2A
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

const GiftSection: React.FC = () => {
  const { toast, showToast, ToastComponent } = useToast();

  const clabe = '1234 5678 9012 3456';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(clabe.replace(/\s/g, ''));
      showToast('CLABE copiada al portapapeles');
    } catch {
      showToast('No se pudo copiar');
    }
  };

  return (
    <section className="py-24 md:py-32 bg-[#FCFBF5] border-t border-b border-[#A8ABAE]/20 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
        >
          {/* Ícono Principal */}
          <div className="w-16 h-16 rounded-full bg-white border border-[#536332]/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Gift className="w-8 h-8 text-[#536332]" strokeWidth={1.5} />
          </div>

          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-[#2B1A2A] mb-4">
            Mesa de Regalos
          </h2>
          <div className="w-16 h-[1px] bg-[#536332] mx-auto mb-6"></div>
          
          <p className="font-sans text-sm md:text-base text-[#2B1A2A]/80 mb-12 max-w-xl mx-auto leading-relaxed font-light">
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
              className="flex flex-col items-center justify-center p-8 bg-white border border-[#A8ABAE]/30 hover:border-[#536332] transition-all duration-500 shadow-[0_15px_30px_-15px_rgba(43,26,42,0.08)] group w-full sm:w-72 rounded-sm"
            >
              <span className="font-serif italic text-2xl mb-2 text-[#2B1A2A]">Liverpool</span>
              <span className="text-xs font-sans text-[#A8ABAE] uppercase tracking-[0.25em] group-hover:text-[#536332] transition-colors font-medium">
                Ver Lista de Regalos
              </span>
            </motion.a>

          </div>

        </motion.div>
      </div>

      <ToastComponent message={toast.message} show={toast.show} />
    </section>
  );
};

export default GiftSection;