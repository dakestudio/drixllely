import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RSVPData, Invitado } from '@/types';
import { getInvitado, updateRSVP } from '@/lib/firebase';
import { Check, Loader2, AlertCircle, UserX } from 'lucide-react';

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

  // ─── Read invite code from URL ──────────────────────────
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
      // Si ya confirmó y no tiene espacio extra (o si declinó asitir), bloqueamos el formulario.
      // Pero si confirmó asistir y le aumentaron los pases (maxInvitados > numInvitados), le permitimos editar.
      if (data.confirmado && (data.asistira === 'no' || (data.numInvitados || 0) >= data.maxInvitados)) {
        setInvitado(data);
        setStatus('already-confirmed');
        return;
      }

      setInvitado(data);
      // Pre-poblar el formulario con sus datos existentes si es que va a re-confirmar acompañantes extra
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

  // ─── Update companion name fields when numInvitados changes ──
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

  // ─── Loading State ─────────────────────────────────────
  if (status === 'loading') {
    return (
      <section id="rsvp-section" className="py-24 bg-white text-center">
        <Loader2 className="w-8 h-8 animate-spin text-wedding-olive mx-auto" />
        <p className="mt-4 font-sans text-sm text-gray-500">Cargando tu invitación...</p>
      </section>
    );
  }

  // ─── Invalid Code ──────────────────────────────────────
  if (status === 'invalid-code') {
    return (
      <section id="rsvp-section" className="py-24 bg-white text-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto"
        >
          <UserX className="w-16 h-16 mx-auto mb-6 text-gray-400" />
          <h2 className="font-display text-2xl text-wedding-charcoal mb-4">Invitación no encontrada</h2>
          <p className="font-sans text-gray-500 text-sm">
            El código de invitación no es válido. Si crees que es un error, contacta a los novios.
          </p>
        </motion.div>
      </section>
    );
  }

  // ─── Already Confirmed ─────────────────────────────────
  if (status === 'already-confirmed' && invitado) {
    return (
      <section className="py-24 bg-white text-center px-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-md mx-auto bg-wedding-beige p-12 border border-wedding-sand"
        >
          <Check className="w-16 h-16 mx-auto mb-6 text-wedding-olive" />
          <h2 className="font-display text-2xl text-wedding-charcoal mb-4">¡Ya confirmaste, {invitado.nombre}!</h2>
          <p className="font-sans text-gray-500 text-sm">
            Tu respuesta fue: <strong>{invitado.asistira === 'yes' ? `Sí, ${invitado.numInvitados} persona(s)` : 'No podré asistir'}</strong>
          </p>
        </motion.div>
      </section>
    );
  }

  // ─── Success State ─────────────────────────────────────
  if (status === 'success') {
    return (
      <section id="rsvp-section" className="py-16 md:py-24 bg-white text-center px-6 min-h-[60vh] flex items-center justify-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-lg mx-auto bg-wedding-beige p-12 border border-wedding-sand"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          >
            <Check className="w-20 h-20 mx-auto mb-6 text-wedding-gold drop-shadow-lg" />
          </motion.div>
          <h2 className="font-display text-3xl text-wedding-charcoal mb-4">¡Gracias por confirmar!</h2>
          <p className="font-sans font-light text-gray-600 mb-2">
            {formData.asistira === 'yes'
              ? `Hemos registrado ${formData.numInvitados} persona(s). ¡Nos emociona verte ahí!`
              : 'Lamentamos que no puedas asistir. ¡Te tendremos presente!'}
          </p>
          {invitado && (
            <p className="font-sans text-sm text-gray-400 mt-4">
              Confirmado como: {invitado.nombre}
            </p>
          )}
        </motion.div>
      </section>
    );
  }

  // ─── No Invite Code (public view) ─────────────────────
  if (!invitado) {
    return (
      <section className="py-16 md:py-24 bg-white relative">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-wedding-charcoal mb-4">RSVP</h2>
            <p className="font-serif italic text-gray-500 mb-8">Confirma tu asistencia</p>
            <div className="bg-wedding-beige p-8 md:p-12 border border-wedding-sand max-w-md mx-auto">
              <p className="font-sans text-gray-600 text-sm leading-relaxed">
                Para confirmar tu asistencia, usa el enlace personalizado que recibiste en tu invitación.
                Si no lo tienes, contacta a los novios.
                Tu presencia hará aún más especial este día. Nos encantará contar contigo para celebrar nuestro amor. Por favor, confirma tu asistencia antes del 31 de Octubre  
              </p>
              <p className="font-sans text-gray-600 text-sm leading-relaxed">
                Hemos elegido con mucho amor a quienes queremos a nuestro lado en este día tan especial, por lo cual esta invitación es personal e intransferible. 
              </p>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  // ─── Main Form ─────────────────────────────────────────
  return (
    <section id="rsvp-section" className="py-16 md:py-24 bg-white relative">
      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-wedding-charcoal mb-4">RSVP</h2>
          <p className="font-serif italic text-gray-500">Hola <span className="text-wedding-olive font-semibold not-italic">{invitado.nombre}</span>, confirma tu asistencia</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-8 bg-wedding-beige p-8 md:p-12 shadow-inner border border-wedding-sand">
          {/* Teléfono */}
          <div className="flex flex-col">
            <label className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-2">
              Teléfono de contacto <span className="text-red-400">*</span>
            </label>
            <input
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
              maxLength={12}
              className="bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-wedding-olive transition-colors font-serif text-lg text-wedding-charcoal"
              placeholder="Ej. 55 1234 5678"
            />
          </div>

          {/* Asistencia */}
          <div className="flex flex-col items-center justify-center py-4">
            <label className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-6">
              ¿Asistirás? <span className="text-red-400">*</span>
            </label>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, asistira: 'yes' }))}
                className={`px-6 sm:px-8 py-3 border transition-all duration-300 text-sm sm:text-base tracking-wider uppercase ${
                  formData.asistira === 'yes'
                    ? 'bg-wedding-olive text-white border-wedding-olive'
                    : 'border-gray-300 text-gray-500 hover:border-wedding-olive'
                }`}
              >
                Sí, asistiré
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, asistira: 'no', numInvitados: 1, nombresAcompanantes: [] }))}
                className={`px-6 sm:px-8 py-3 border transition-all duration-300 text-sm sm:text-base tracking-wider uppercase ${
                  formData.asistira === 'no'
                    ? 'bg-wedding-charcoal text-white border-wedding-charcoal'
                    : 'border-gray-300 text-gray-500 hover:border-wedding-charcoal'
                }`}
              >
                No podré asistir
              </button>
            </div>
          </div>

          {/* ─── Campos que solo aparecen si asiste ──────── */}
          <AnimatePresence>
            {formData.asistira === 'yes' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="overflow-hidden space-y-8"
              >
                {invitado.maxInvitados > 1 && (
                  <div className="bg-white/60 border border-wedding-sand rounded px-4 py-3 text-center mb-6">
                    <p className="font-sans text-sm text-wedding-charcoal">
                      Tienes <strong>{invitado.maxInvitados - 1}</strong> {invitado.maxInvitados - 1 === 1 ? 'pase extra' : 'pases extras'} para acompañantes
                    </p>
                  </div>
                )}
                {invitado.maxInvitados > 1 && (
                  <div className="flex flex-col">
                    <label className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-2">
                      ¿Cuántos acompañantes llevarás? <span className="text-red-400">*</span>
                    </label>
                    <div className="relative mt-2">
                      <select
                        value={formData.numInvitados}
                        onChange={(e) => setFormData(prev => ({ ...prev, numInvitados: Number(e.target.value) }))}
                        className={`w-full appearance-none bg-transparent border-b-2 py-3 pr-8 focus:outline-none transition-colors font-serif text-lg cursor-pointer ${
                          formData.numInvitados === 0 
                            ? 'border-gray-300 text-gray-400 focus:border-wedding-olive' 
                            : 'border-wedding-olive text-wedding-charcoal'
                        }`}
                      >
                        <option value={0} disabled>Selecciona una opción...</option>
                        {Array.from({ length: invitado.maxInvitados }, (_, i) => (
                          <option key={i} value={i + 1} className="text-wedding-charcoal">
                            {i === 0 ? 'Iré solo' : i === 1 ? '1 acompañante' : `${i} acompañantes`}
                          </option>
                        ))}
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nombres de acompañantes */}
                <AnimatePresence>
                  {formData.numInvitados > 1 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden space-y-4"
                    >
                      <label className="font-sans text-xs uppercase tracking-widest text-gray-500 block">
                        Nombres de tus acompañantes <span className="text-red-400">*</span>
                      </label>
                      {formData.nombresAcompanantes.map((name, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                        >
                          <input
                            type="text"
                            value={name}
                            onChange={(e) => handleCompanionNameChange(index, e.target.value)}
                            className="w-full bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-wedding-olive transition-colors font-serif text-lg text-wedding-charcoal"
                            placeholder={`Acompañante ${index + 1}`}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Restricciones alimenticias toggle */}
                <div className="flex flex-col">
                  <label className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-4">
                    ¿Alguna restricción alimenticia?
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tieneRestricciones: false, restricciones: '' }))}
                      className={`px-6 py-2 border transition-all duration-300 text-sm ${
                        formData.tieneRestricciones === false
                          ? 'bg-wedding-olive text-white border-wedding-olive'
                          : 'border-gray-300 text-gray-500 hover:border-wedding-olive'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, tieneRestricciones: true }))}
                      className={`px-6 py-2 border transition-all duration-300 text-sm ${
                        formData.tieneRestricciones === true
                          ? 'bg-wedding-olive text-white border-wedding-olive'
                          : 'border-gray-300 text-gray-500 hover:border-wedding-olive'
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
                          className="w-full bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-wedding-olive font-serif text-lg resize-none"
                          placeholder="Alergias, vegetariano, vegano, etc."
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mensaje para los novios (siempre visible si ya eligió asistencia) */}
          <AnimatePresence>
            {formData.asistira !== null && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col">
                  <label className="font-sans text-xs uppercase tracking-widest text-gray-500 mb-2">
                    Mensaje para los novios <span className="text-gray-400 normal-case tracking-normal">(opcional)</span>
                  </label>
                  <textarea
                    value={formData.mensaje}
                    onChange={(e) => setFormData(prev => ({ ...prev, mensaje: e.target.value }))}
                    rows={3}
                    className="bg-transparent border-b border-gray-400 py-2 focus:outline-none focus:border-wedding-olive font-serif text-lg resize-none"
                    placeholder="Escribe un mensaje especial..."
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error message */}
          {status === 'error' && (
            <div className="text-red-800 bg-red-50 p-3 flex items-center justify-center text-sm">
              <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" /> Por favor completa los campos requeridos.
            </div>
          )}

          {/* Submit button */}
          {formData.asistira !== null && (
            <div className="text-center pt-6">
              <button
                type="submit"
                disabled={status === 'submitting'}
                className="bg-wedding-gold text-white px-12 py-4 font-sans text-sm uppercase tracking-[0.2em] hover:bg-yellow-600 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'submitting' ? (
                  <Loader2 className="animate-spin w-5 h-5 mx-auto" />
                ) : (
                  'Enviar Confirmación'
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
