import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RSVPData, Invitado } from '@/types';
import { getInvitado, updateRSVP } from '@/lib/firebase';
import { Check, Loader2, AlertCircle, UserX, WifiOff, Sparkles } from 'lucide-react';

// Paleta: usa los tokens wedding-lila / -pearl / -olive / -cream.
// Se definen en el bloque @theme de src/index.css (fuente unica).

/**
 * `validation-error` (the guest left a required field empty) and
 * `network-error` (Firestore rejected the write) used to share one state, so a
 * failed save told the guest to "fill in the required fields" with the form
 * already complete. They are separate now, with their own copy.
 */
type FormStatus =
  | 'loading'
  | 'idle'
  | 'submitting'
  | 'success'
  | 'validation-error'
  | 'network-error'
  | 'connection-error'
  | 'invalid-code'
  | 'already-confirmed';

const RSVPForm: React.FC = () => {
  const [invitado, setInvitado] = useState<Invitado | null>(null);
  const [status, setStatus] = useState<FormStatus>('loading');
  const [inviteCode, setInviteCode] = useState<string>('');

  const [formData, setFormData] = useState<RSVPData>({
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
      let data: Invitado | null;
      try {
        data = await getInvitado(code);
      } catch {
        // Could not reach Firestore — that is not the same as a bad code.
        setStatus('connection-error');
        return;
      }

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

    if (!formData.asistira) {
      setStatus('validation-error');
      return;
    }

    if (formData.asistira === 'yes') {
      if (formData.numInvitados === 0) {
        setStatus('validation-error');
        return;
      }
      const emptyCompanion = formData.nombresAcompanantes.some(n => !n.trim());
      if (formData.numInvitados > 1 && emptyCompanion) {
        setStatus('validation-error');
        return;
      }
    }

    setStatus('submitting');

    try {
      await updateRSVP(inviteCode, {
        ...formData,
        nombresAcompanantes: formData.asistira === 'yes' ? formData.nombresAcompanantes : [],
        numInvitados: formData.asistira === 'yes' ? formData.numInvitados : 0,
        restricciones: formData.tieneRestricciones ? formData.restricciones : '',
      });
    } catch {
      setStatus('network-error');
      return;
    }

    setStatus('success');
    requestAnimationFrame(() => {
      document.getElementById('rsvp-section')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    });
  };

  // Loading State
  if (status === 'loading') {
    return (
      <section id="rsvp-section" className="py-32 bg-wedding-cream text-center">
        <Loader2 className="w-10 h-10 animate-spin text-wedding-olive mx-auto" />
        <p className="mt-4 font-sans text-xs tracking-widest uppercase text-wedding-pearl">Cargando tu invitación...</p>
      </section>
    );
  }

  // Invalid Code
  if (status === 'invalid-code') {
    return (
      <section id="rsvp-section" className="py-24 bg-wedding-cream text-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white p-10 rounded-sm shadow-md border border-wedding-pearl/20"
        >
          <UserX className="w-12 h-12 mx-auto mb-4 text-wedding-pearl" />
          <h2 className="font-serif italic text-2xl text-wedding-lila mb-3">Invitación no encontrada</h2>
          <p className="font-sans text-wedding-lila/70 text-sm font-light leading-relaxed">
            El código de invitación no es válido. Por favor, ponte en contacto con los novios.
          </p>
        </motion.div>
      </section>
    );
  }

  // Could not reach the database
  if (status === 'connection-error') {
    return (
      <section id="rsvp-section" className="py-24 bg-wedding-cream text-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-white p-10 rounded-sm shadow-md border border-wedding-pearl/20"
        >
          <WifiOff className="w-12 h-12 mx-auto mb-4 text-wedding-pearl" />
          <h2 className="font-serif italic text-2xl text-wedding-lila mb-3">Sin conexión</h2>
          <p className="font-sans text-wedding-lila/70 text-sm font-light leading-relaxed mb-6">
            No pudimos cargar tu invitación. Revisa tu conexión a internet e inténtalo de nuevo.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-8 py-3 border border-wedding-olive text-wedding-olive hover:bg-wedding-olive hover:text-wedding-cream transition-all duration-500 text-xs uppercase tracking-[0.25em] font-medium rounded-full"
          >
            Reintentar
          </button>
        </motion.div>
      </section>
    );
  }

  // Already Confirmed
  if (status === 'already-confirmed' && invitado) {
    return (
      <section className="py-24 bg-wedding-cream text-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="max-w-md mx-auto bg-white p-10 border border-wedding-olive/30 shadow-xl rounded-sm"
        >
          <div className="w-14 h-14 bg-wedding-olive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-wedding-olive" />
          </div>
          <h2 className="font-serif italic text-3xl text-wedding-lila mb-3">¡Ya confirmaste, {invitado.nombre}!</h2>
          <p className="font-sans text-wedding-lila/80 text-sm font-light">
            Tu respuesta registrada: <strong className="font-medium text-wedding-olive">{invitado.asistira === 'yes' ? `Sí, ${invitado.numInvitados} persona(s)` : 'No podré asistir'}</strong>
          </p>
        </motion.div>
      </section>
    );
  }

  // Success State
  if (status === 'success') {
    return (
      <section id="rsvp-section" className="py-24 bg-wedding-cream text-center px-6 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-lg mx-auto bg-white p-12 border border-wedding-olive/30 shadow-2xl relative overflow-hidden rounded-sm"
        >
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 180 }}
            className="w-20 h-20 bg-wedding-olive rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"
          >
            <Check className="w-10 h-10 text-wedding-cream" strokeWidth={2} />
          </motion.div>
          <h2 className="font-serif italic text-3xl md:text-4xl text-wedding-lila mb-4">¡Respuesta Confirmada!</h2>
          <p className="font-sans font-light text-wedding-lila/80 mb-4 leading-relaxed text-sm md:text-base">
            {formData.asistira === 'yes'
              ? `Hemos registrado ${formData.numInvitados} persona(s). ¡Nos llena de ilusión compartir este momento contigo!`
              : 'Lamentamos mucho que no puedas acompañarnos. Te enviaremos todo nuestro cariño en este día.'}
          </p>
          {invitado && (
            <p className="font-sans text-xs tracking-widest uppercase text-wedding-pearl mt-6 pt-6 border-t border-wedding-pearl/20">
              Invitación registrada para: <span className="text-wedding-lila font-medium">{invitado.nombre}</span>
            </p>
          )}
        </motion.div>
      </section>
    );
  }

  // No Invite Code (Public View)
  if (!invitado) {
    return (
      <section className="py-24 bg-wedding-cream relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            viewport={{ once: true }}
          >
            <Sparkles className="w-6 h-6 text-wedding-pearl mx-auto mb-3" />
            <h2 className="font-serif italic text-4xl sm:text-5xl text-wedding-lila mb-3">RSVP</h2>
            <div className="w-12 h-[1px] bg-wedding-olive mx-auto mb-8"></div>
            
            <div className="bg-white p-8 md:p-12 border border-wedding-pearl/30 shadow-lg max-w-lg mx-auto rounded-sm space-y-4">
              <p className="font-sans text-wedding-lila/80 text-sm leading-relaxed font-light">
                Para confirmar tu asistencia, utiliza el enlace personal que recibiste en tu invitación.
              </p>
              <p className="font-sans text-wedding-lila/80 text-sm leading-relaxed font-light">
                Por favor, confirma antes del <strong className="font-medium text-wedding-olive">31 de Octubre</strong>. 
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
    <section id="rsvp-section" className="py-24 md:py-32 bg-wedding-cream relative overflow-hidden">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-serif italic text-4xl sm:text-5xl md:text-6xl text-wedding-lila mb-3">Confirmación</h2>
          <p className="font-sans text-xs uppercase tracking-[0.3em] text-wedding-pearl">
            Hola <span className="text-wedding-olive font-semibold">{invitado.nombre}</span>, será un honor contar contigo
          </p>
        </motion.div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-10 bg-white p-8 md:p-14 shadow-form border border-wedding-pearl/20 rounded-sm">
          
          {/* Asistencia Select Buttons */}
          <div className="flex flex-col items-center justify-center py-2">
            <label className="font-sans text-xs uppercase tracking-[0.2em] text-wedding-pearl mb-6">
              ¿Nos acompañarás? <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, asistira: 'yes' }))}
                className={`px-8 py-3.5 border transition-all duration-500 text-xs tracking-[0.2em] uppercase rounded-full font-medium ${
                  formData.asistira === 'yes'
                    ? 'bg-wedding-olive text-wedding-cream border-wedding-olive shadow-md'
                    : 'border-wedding-pearl/40 text-wedding-lila/70 hover:border-wedding-olive'
                }`}
              >
                Sí, asistiré
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, asistira: 'no', numInvitados: 1, nombresAcompanantes: [] }))}
                className={`px-8 py-3.5 border transition-all duration-500 text-xs tracking-[0.2em] uppercase rounded-full font-medium ${
                  formData.asistira === 'no'
                    ? 'bg-wedding-lila text-wedding-cream border-wedding-lila shadow-md'
                    : 'border-wedding-pearl/40 text-wedding-lila/70 hover:border-wedding-lila'
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
                className="overflow-hidden space-y-8 pt-4 border-t border-wedding-pearl/20"
              >
                {invitado.maxInvitados > 1 && (
                  <div className="bg-wedding-cream border border-wedding-olive/30 rounded-sm px-4 py-3 text-center">
                    <p className="font-sans text-xs uppercase tracking-widest text-wedding-olive">
                      Tienes <strong>{invitado.maxInvitados - 1}</strong> {invitado.maxInvitados - 1 === 1 ? 'pase extra' : 'pases extras'} para acompañantes
                    </p>
                  </div>
                )}

                {invitado.maxInvitados > 1 && (
                  <div className="flex flex-col">
                    <label className="font-sans text-xs uppercase tracking-[0.2em] text-wedding-pearl mb-3">
                      ¿Cuántos acompañantes asistirán contigo? <span className="text-red-400">*</span>
                    </label>
                    <div className="relative mt-1">
                      <select
                        value={formData.numInvitados}
                        onChange={(e) => setFormData(prev => ({ ...prev, numInvitados: Number(e.target.value) }))}
                        className={`w-full appearance-none bg-transparent border-b-2 py-3 pr-8 focus:outline-none transition-colors font-serif text-lg cursor-pointer ${
                          formData.numInvitados === 0 
                            ? 'border-wedding-pearl/40 text-wedding-pearl' 
                            : 'border-wedding-olive text-wedding-lila'
                        }`}
                      >
                        <option value={0} disabled>Selecciona la cantidad...</option>
                        {Array.from({ length: invitado.maxInvitados }, (_, i) => (
                          <option key={i} value={i + 1} className="text-wedding-lila">
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
                      <label className="font-sans text-xs uppercase tracking-[0.2em] text-wedding-pearl block">
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
                            className="w-full bg-transparent border-b border-wedding-pearl/40 py-2 focus:outline-none focus:border-wedding-olive font-serif text-lg text-wedding-lila"
                            placeholder={`Nombre del Acompañante ${index + 1}`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Restricciones Alimenticias */}
                <div className="flex flex-col">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-wedding-pearl mb-4">
                    ¿Alguien tiene restricciones alimenticias o alergias? <span className="normal-case text-wedding-pearl/70">(opcional)</span>
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tieneRestricciones: false, restricciones: '' }))}
                      className={`px-6 py-2 border transition-all text-xs tracking-widest uppercase rounded-full ${
                        formData.tieneRestricciones === false
                          ? 'bg-wedding-olive text-wedding-cream border-wedding-olive'
                          : 'border-wedding-pearl/40 text-wedding-lila/70'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tieneRestricciones: true }))}
                      className={`px-6 py-2 border transition-all text-xs tracking-widest uppercase rounded-full ${
                        formData.tieneRestricciones === true
                          ? 'bg-wedding-olive text-wedding-cream border-wedding-olive'
                          : 'border-wedding-pearl/40 text-wedding-lila/70'
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
                          className="w-full bg-transparent border-b border-wedding-pearl/50 py-2 focus:outline-none focus:border-wedding-olive font-serif text-lg text-wedding-lila resize-none"
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
                className="overflow-hidden pt-4 border-t border-wedding-pearl/20"
              >
                <div className="flex flex-col">
                  <label className="font-sans text-xs uppercase tracking-[0.2em] text-wedding-pearl mb-3">
                    Un mensaje especial para nosotros <span className="normal-case text-wedding-pearl/70">(opcional)</span>
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                    rows={3}
                    className="bg-transparent border-b border-wedding-pearl/50 py-2 focus:outline-none focus:border-wedding-olive font-serif text-lg text-wedding-lila resize-none"
                    placeholder="Escribe tus palabras o buenos deseos..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Messages */}
          {(status === 'validation-error' || status === 'network-error') && (
            <div
              role="alert"
              className="text-red-700 bg-red-50 p-3 rounded-sm flex items-center justify-center text-xs uppercase tracking-wider text-center"
            >
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
              {status === 'validation-error'
                ? 'Por favor completa los campos obligatorios.'
                : 'No pudimos guardar tu respuesta. Revisa tu conexión e inténtalo de nuevo.'}
            </div>
          )}

          {/* Submit Button */}
          {formData.asistira !== null && (
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-wedding-olive text-wedding-cream px-12 py-4 font-sans text-xs uppercase tracking-[0.25em] hover:bg-wedding-lila transition-all duration-500 rounded-full shadow-lg disabled:opacity-50"
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