import React from 'react';
import { motion } from 'framer-motion';

/*
 * Los ornamentos no fijan color propio: heredan `currentColor` del contenedor.
 * Antes forzaban `text-wedding-gold`, que pisaba el olivo del padre y era la
 * razón de que se vieran dorados dentro de secciones ya migradas a la paleta.
 * La opacidad se aplica con `opacity-*` para no volver a atar el tono.
 */

export const DividerOrnament: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 100 20"
    className={`w-32 h-auto opacity-60 ${className}`}
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M50 15 C40 15 35 10 25 10 C15 10 10 15 0 15 L0 16 C10 16 15 11 25 11 C35 11 40 16 50 16 C60 16 65 11 75 11 C85 11 90 16 100 16 L100 15 C90 15 85 10 75 10 C65 10 60 15 50 15 Z" />
    <circle cx="50" cy="15.5" r="2" />
  </svg>
);

export const CornerOrnament: React.FC<{ className?: string; rotate?: number }> = ({ className = "", rotate = 0 }) => (
  <motion.svg
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 0.4, scale: 1 }}
    transition={{ duration: 1.5, delay: 0.2 }}
    viewBox="0 0 100 100"
    className={`w-24 h-24 absolute ${className}`}
    style={{ transform: `rotate(${rotate}deg)` }}
    fill="none"
    stroke="currentColor"
    strokeWidth="1"
    aria-hidden="true"
  >
    <path d="M10,10 L40,10 M10,10 L10,40" />
    <path d="M15,15 L35,15 M15,15 L15,35" strokeWidth="0.5" />
    <circle cx="10" cy="10" r="2" fill="currentColor" stroke="none" />
  </motion.svg>
);
