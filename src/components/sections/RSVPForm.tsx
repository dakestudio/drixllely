import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RSVPData, Invitado } from '@/types';
import { getInvitado, updateRSVP } from '@/lib/firebase';
import { Check, Loader2, AlertCircle, UserX, HeartHandshake, Sparkles } from 'lucide-react';

// --- PALETA OFICIAL DE LA BODA ---
// Dark Lila: #2B1A2A
// Gris Perla: #A8ABAE
// Verde Olivo: #536332
// Blanco: #FCFBF5

type FormStatus = 'loading' | 'idle' | 'submitting' | 'success' | 'error' | 'invalid-code' | 'already-confirmed';

const RSVPForm: React.FC = () => {
  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [status, setStatus] = useState<FormStatus>('loading');
  const [inviteCode, setInviteCode] = useState<string>('');

  const [formData, setFormData] = useState<RSVPData>({
    telefono: '',
    asistira: null,
    numInvitados: 0,
    nombresAcompanantes: [],
    tieneRestricciones: null,
    restricciones: '',
    mensaje: '',
  });

  // Read invite code from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('invite');

    if (!code) {
      setStatus('idle');
      return;
    }

    setInviteCode(code);
    
    const fetchInvitado = async () => {
      const data = await getInvitado(code);
      if (!data) {
        setStatus('invalid-code');
        return;
      }

      if (data.confirmado && (data.asistira === 'no' || (data.numInvitados || 0) >= data.maxInvitados)) {
        setInvitado(data);
        setStatus('already-confirmed');
        return;
      }

      setInvitado(data);
      setFormData({
        telefono: data.telefono || '',
        asistira: data.asistira || null,
        numInvitados: data.numInvitados || (data.maxInvitados === 1 ? 1 : 0),
        nombresAcompanantes: data.nombresAcompanantes || [],
        tieneRestricciones: data.tieneRestricciones || null,
        restricciones: data.restricciones || '',
        mensaje: data.mensaje || '',
      });
      setStatus('idle');
    };

    fetchInvitado();
  }, []);

  // Update companion name fields when numInvitados changes
  useEffect(() => {
    const numCompanions = Math.max(0, formData.numInvitados - 1);
    setFormData(prev => {
      const currentNames = [...prev.nombresAcompanantes];
      if (numCompanions > currentNames.length) {
        return {
          ...prev,
          nombresAcompanantes: [
            ...currentNames,
            ...Array(numCompanions - currentNames.length).fill(''),
          ],
        };
      }
      return {
        ...prev,
        nombresAcompanantes: currentNames.slice(0, numCompanions),
      };
    });
  }, [formData.numInvitados]);

  const handleCompanionNameChange = (index: number, value: string) => {
    setFormData(prev => {
      const names = [...prev.nombresAcompanantes];
      names[index] = value;
      return { ...prev, nombresAcompanantes: names };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.telefono || !formData.asistira) {
      setStatus('error');
      return;
    }

    if (formData.asistira === 'yes') {
      if (formData.numInvitados === 0) {
        setStatus('error');
        return;
      }
      const emptyCompanion = formData.nombresAcompanantes.some(n => !n.trim());
      if (formData.numInvitados > 1 && emptyCompanion) {
        setStatus('error');
        return;
      }
    }

    setStatus('submitting');

    const success = await updateRSVP(inviteCode, {
      ...formData,
      nombresAcompanantes: formData.asistira === 'yes' ? formData.nombresAcompanantes : [],
      numInvitados: formData.asistira === 'yes' ? formData.numInvitados : 0,
      restricciones: formData.tieneRestricciones ? formData.restricciones : '',
    });

    if (success) {
      setStatus('success');
      setTimeout(() => {
        const element = document.getElementById('rsvp-section');
        if (element) {
          const headerOffset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    } else {
      setStatus('error');
    }
  };

  // Loading State
  if (status === 'loading') {
    return (
      <section id="rsvp-section" className="py-32 bg-[#FCFBF5] text-center">
        <Loader2 className="w-10 h-10 animate-spin text-[#536332] mx-auto" />
        <p className="mt-4 font-sans text-xs tracking-widest uppercase text-[#A8ABAE]">Cargando tu invitación...</p>
      </section>
    );
  }

  // Invalid Code
  if (status === 'invalid-code') {
    return (
      <section id="rsvp-section" className="py-24 bg-[#FCFBF5] text-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white p-10 rounded-sm shadow-md border border-[#A8ABAE]/20"
        >
          <UserX className="w-12 h-12 mx-auto mb-4 text-[#A8ABAE]" />
          <h2 className="font-serif italic text-2xl text-[#2B1A2A] mb-3">Invitación no encontrada</h2>
          <p className="font-sans text-[#2B1A2A]/70 text-sm font-light leading-relaxed">
            El código de invitación no es válido. Por favor, ponte en contacto con los novios.
          </p>
        </motion.div>
      </section>
    );
  }

  // Already Confirmed
  if (status === 'already-confirmed' && invitado) {
    return (
      <section className="py-24 bg-[#FCFBF5] text-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto bg-white p-10 border border-[#536332]/30 shadow-xl rounded-sm"
        >
          <div className="w-14 h-14 bg-[#536332]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-[#536332]" />
          </div>
          <h2 className="font-serif italic text-3xl text-[#2B1A2A] mb-3">¡Ya confirmaste, {invitado.nombre}!</h2>
          <p className="font-sans text-[#2B1A2A]/80 text-sm font-light">
            Tu respuesta registrada: <strong className="font-medium text-[#536332]">{invitado.asistira === 'yes' ? `Sí, ${invitado.numInvitados} persona(s)` : 'No podré asistir'}</strong>
          </p>
        </motion.div>
      </section>
    );
  }

  // Success State
  if (status === 'success') {
    return (
      <section id="rsvp-section" className="py-24 bg-[#FCFBF5] text-center px-6 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg mx-auto bg-white p-12 border border-[#536332]/30 shadow-2xl relative overflow-hidden rounded-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
            className="w-20 h-20 bg-[#536332] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Check className="w-10 h-10 text-[#FCFBF5]" strokeWidth={2} />
          </motion.div>
          <h2 className="font-serif italic text-3xl md:text-4xl text-[#2B1A2A] mb-4">¡Respuesta Confirmada!</h2>
          <p className="font-sans font-light text-[#2B1A2A]/80 mb-4 leading-relaxed text-sm md:text-base">
            {formData.asistira === 'yes'
              ? `Hemos registrado ${formData.numInvitados} persona(s). ¡Nos llena de ilusión compartir este momento contigo!`
              : 'Lamentamos mucho que no puedas acompañarnos. Te enviaremos todo nuestro cariño en este día.'}
          </p>
          {invitado && (
            <p className="font-sans text-xs tracking-widest uppercase text-[#A8ABAE] mt-6 pt-6 border-t border-[#A8ABAE]/20">
              Invitación registrada para: <span className="text-[#2B1A2A] font-medium">{invitado.nombre}</span>
            </p>
          )}
        </motion.div>
      </section>
    );
  }

  // No Invite Code (Public View)
  if (!invitado) {
    return (
      <section className="py-24 bg-[#FCFBF5] relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-6 h-6 text-[#A8ABAE] mx-auto mb-3" />
            <h2 className="font-serif italic text-4xl sm:text-5xl text-[#2B1A2A] mb-3">RSVP</h2>
            <div className="w-12 h-[1px] bg-[#536332] mx-auto mb-8"></div>
            
            <div className="bg-white p-8 md:p-12 border border-[#A8ABAE]/30 shadow-lg max-w-lg mx-auto rounded-sm space-y-4">
              <p className="font-sans text-[#2B1A2A]/80 text-sm leading-relaxed font-light">
                Para confirmar tu asistencia, utiliza el enlace personal que recibiste en tu invitación.
              </p>
              <p className="font-sans text-[#2B1A2A]/80 text-sm leading-relaxed font-light">
                Por favor, confirma antes del <strong className="font-medium text-[#536332]">31 de Octubre</strong>. 
                Esta invitación es personal e intransferible.
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // Main Form
  return (
    <section id="rsvp-section" className="py-24 md:py-32 bg-[#FCFBF5] relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-[#2B1A2A] mb-3">Confirmación</h2>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-[#A8ABAE]">
            Hola <span className="text-[#536332] font-semibold">{invitado.nombre}</span>, será un honor contar contigo
          </p>
        </motion.div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 md:p-14 shadow-[0_20px_50px_-20px_rgba(43,26,42,0.12)] border border-[#A8ABAE]/20 rounded-sm">
          
          {/* Teléfono */}
          <div className="flex flex-col">
            <label className="font-sans text-xs uppercase tracking-[0.2em] text-[#A8ABAE] mb-3">
              Teléfono de contacto <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              maxLength={12}
              className="bg-transparent border-b border-[#A8ABAE]/50 py-3 focus:outline-none focus:border-[#536332] transition-all font-serif text-xl text-[#2B1A2A]"
              placeholder="Ej. 55 1234 5678"
            />
          </div>

          {/* Asistencia Select Buttons */}
          <div className="flex flex-col items-center justify-center py-2">
            <label className="font-sans text-xs uppercase tracking-[0.2em] text-[#A8ABAE] mb-6">
              ¿Nos acompañarás? <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, asistira: 'yes' }))}
                className={`px-8 py-3.5 border transition-all duration-500 text-xs tracking-[0.2em] uppercase rounded-full font-medium ${
                  formData.asistira === 'yes'
                    ? 'bg-[#536332] text-[#FCFBF5] border-[#536332] shadow-md'
                    : 'border-[#A8ABAE]/40 text-[#2B1A2A]/70 hover:border-[#536332]'
                }`}
              >
                Sí, asistiré
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, asistira: 'no', numInvitados: 1, nombresAcompanantes: [] }))}
                className={`px-8 py-3.5 border transition-all duration-500 text-xs tracking-[0.2em] uppercase rounded-full font-medium ${
                  formData.asistira === 'no'
                    ? 'bg-[#2B1A2A] text-[#FCFBF5] border-[#2B1A2A] shadow-md'
                    : 'border-[#A8ABAE]/40 text-[#2B1A2A]/70 hover:border-[#2B1A2A]'
                }`}
              >
                No podré asistir
              </button>
            </div>
          </div>

          {/* Conditional Sections with Smooth Motion */}
          <AnimatePresence>
            {formData.asistira === 'yes' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden space-y-8 pt-4 border-t border-[#A8ABAE]/20"
              >
                {invitado.maxInvitados > 1 && (
                  <div className="bg-[#FCFBF5] border border-[#536332]/30 rounded-sm px-4 py-3 text-center">
                    <p className="font-sans text-xs uppercase tracking-widest text-[#536332]">
                      Tienes <strong>{invitado.maxInvitados - 1}</strong> {invitado.maxInvitados - 1 === 1 ? 'pase extra' : 'pases extras'} para acompañantes
                    </p>
                  </div>
                )}

                {invitado.maxInvitados > 1 && (
                  <div className="flex flex-col">
                    <label className="font-sans text-xs uppercase tracking-[0.2em] text-[#A8ABAE] mb-3">
                      ¿Cuántos acompañantes asistirán contigo? <span className="text-red-400">*</span>
                    </label>
                    <div className="relative mt-1">
                      <select
                        value={formData.numInvitados}
                        onChange={(e) => setFormData(prev => ({ ...prev, numInvitados: Number(e.target.value) }))}
                        className={`w-full appearance-none bg-transparent border-b-2 py-3 pr-8 focus:outline-none transition-colors font-serif text-lg cursor-pointer ${
                          formData.numInvitados === 0 
                            ? 'border-[#A8ABAE]/40 text-[#A8ABAE]' 
                            : 'border-[#536332] text-[#2B1A2A]'
                        }`}
                      >
                        <option value={0} disabled>Selecciona la cantidad...</option>
                        {Array.from({ length: invitado.maxInvitados }, (_, i) => (
                          <option key={i} value={i + 1} className="text-[#2B1A2A]">
                            {i === 0 ? 'Iré solo/a' : i === 1 ? '1 acompañante' : `${i} acompañantes`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Companion Name Inputs */}
                <AnimatePresence>
                  {formData.numInvitados > 1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="overflow-hidden space-y-4"
                    >
                      <label className="font-sans text-xs uppercase tracking-[0.2em] text-[#A8ABAE] block">
                        Nombres completos de tus acompañantes <span className="text-red-400">*</span>
                      </label>
                      {formData.nombresAcompanantes.map((name, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleCompanionNameChange(index, e.target.value)}
                            className="w-full bg-transparent border-b border-[#A8ABAE]/40 py-2 focus:outline-none focus:border-[#536332] font-serif text-lg text-[#2B1A2A]"
                            placeholder={`Nombre del Acompañante ${index + 1}`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Restricciones Alimenticias */}
                <div className="flex flex-col">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-[#A8ABAE] mb-4">
                    ¿Alguien tiene restricciones alimenticias o alergias?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tieneRestricciones: false, restricciones: '' }))}
                      className={`px-6 py-2 border transition-all text-xs tracking-widest uppercase rounded-full ${
                        formData.tieneRestricciones === false
                          ? 'bg-[#536332] text-[#FCFBF5] border-[#536332]'
                          : 'border-[#A8ABAE]/40 text-[#2B1A2A]/70'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tieneRestricciones: true }))}
                      className={`px-6 py-2 border transition-all text-xs tracking-widest uppercase rounded-full ${
                        formData.tieneRestricciones === true
                          ? 'bg-[#536332] text-[#FCFBF5] border-[#536332]'
                          : 'border-[#A8ABAE]/40 text-[#2B1A2A]/70'
                      }`}
                    >
                      Sí
                    </button>
                  </div>

                  <AnimatePresence>
                    {formData.tieneRestricciones && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-4"
                      >
                        <textarea
                          value={formData.restricciones}
                          onChange={(e) => setFormData(prev => ({ ...prev, restricciones: e.target.value }))}
                          rows={2}
                          className="w-full bg-transparent border-b border-[#A8ABAE]/50 py-2 focus:outline-none focus:border-[#536332] font-serif text-lg text-[#2B1A2A] resize-none"
                          placeholder="Especifícanos (ej. vegetariano, alergia a mariscos, etc.)"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensaje opcional */}
          <AnimatePresence>
            {formData.asistira !== null && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden pt-4 border-t border-[#A8ABAE]/20"
              >
                <div className="flex flex-col">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-[#A8ABAE] mb-3">
                    Un mensaje especial para nosotros <span className="normal-case text-[#A8ABAE]/70">(opcional)</span>
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                    rows={3}
                    className="bg-transparent border-b border-[#A8ABAE]/50 py-2 focus:outline-none focus:border-[#536332] font-serif text-lg text-[#2B1A2A] resize-none"
                    placeholder="Escribe tus palabras o buenos deseos..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Message */}
          {status === 'error' && (
            <div className="text-red-700 bg-red-50 p-3 rounded-sm flex items-center justify-center text-xs uppercase tracking-wider">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> Por favor completa los campos obligatorios.
            </div>
          )}

          {/* Submit Button */}
          {formData.asistira !== null && (
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-[#536332] text-[#FCFBF5] px-12 py-4 font-sans text-xs uppercase tracking-[0.25em] hover:bg-[#2B1A2A] transition-all duration-500 rounded-full shadow-lg disabled:opacity-50"
              >
                {status === 'submitting' ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  'Enviar Respuesta'
                )}
              </button>
            </div>
          )}
        </form>

      </div>
    </section>
  );
};

export default RSVPForm;