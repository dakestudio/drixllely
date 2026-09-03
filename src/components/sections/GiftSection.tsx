import React from 'react';
import { motion } from 'framer-motion';
import { Gift, CreditCard, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

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
    <section className="py-16 md:py-24 bg-wedding-beige">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <Gift className="w-12 h-12 text-wedding-gold mx-auto mb-6" strokeWidth={1} />
          <h2 className="font-display text-3xl sm:text-4xl text-wedding-charcoal mb-6">Mesa de Regalos</h2>
          
          <p className="font-sans text-gray-600 mb-10 max-w-xl mx-auto leading-relaxed">
            Su presencia es nuestro mejor regalo. Sin embargo, si desean tener un detalle con nosotros, 
            hemos preparado algunas opciones para nuestra luna de miel y nuevo hogar.
          </p>

          <div className="flex flex-col md:flex-row justify-center gap-6">
            
            <motion.a
              href="https://mesaderegalos.liverpool.com.mx/milistaderegalos/52023058?category=154"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ y: -5, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
              className="flex flex-col items-center justify-center p-8 bg-white border border-wedding-sand hover:border-wedding-gold transition-all duration-300 group w-full md:w-64"
            >
              <span className="font-display text-xl mb-2 text-wedding-charcoal">Liverpool</span>
              <span className="text-xs font-sans text-gray-400 uppercase tracking-widest group-hover:text-wedding-olive transition-colors">Ver Lista</span>
            </motion.a>
          </div>

          
        </motion.div>
      </div>

      <ToastComponent message={toast.message} show={toast.show} />
    </section>
  );
};

export default GiftSection;