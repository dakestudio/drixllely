import { EventDetail, GalleryImage } from './types';

import momento1 from '@/assets/gallery/momento-1.webp';
import momento2 from '@/assets/gallery/momento-2.webp';
import momento3 from '@/assets/gallery/momento-3.webp';
import momento4 from '@/assets/gallery/momento-4.webp';
import momento5 from '@/assets/gallery/momento-5.webp';
import momento6 from '@/assets/gallery/momento-6.webp';

/**
 * Explicit offset (CDMX, CST) so the countdown reads the same for a guest in
 * Cancún, Tijuana or abroad. Without it the string is parsed in the device's
 * own timezone and the number of days drifts.
 */
export const WEDDING_DATE = "2026-12-18T17:45:00-06:00";

export const COUPLE_NAMES = {
  bride: "Drix",
  groom: "Llely"
};

export const EVENTS: { reception: EventDetail } = {
  reception: {
    title: "Recepción & Fiesta",
    date: "18 de diciembre, 2026",
    time: "17:45 HRS",
    locationName: "Salón Julis",
    address: "Eje 6 Sur Trabajadoras Sociales 1000, San Pedro, Iztapalapa, 09000 Ciudad de México, CDMX",
    mapLink: "https://maps.app.goo.gl/ujvSA4Wb5tUdF3Ph7"
  }
};

/**
 * Intrinsic pixel dimensions are declared so the browser can reserve the right
 * box before the file arrives — no layout shift while the gallery loads.
 */
export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, src: momento1, alt: "Drix y Llely — momento 1", width: 1050, height: 1400 },
  { id: 2, src: momento2, alt: "Drix y Llely — momento 2", width: 933,  height: 1400 },
  { id: 3, src: momento3, alt: "Drix y Llely — momento 3", width: 720,  height: 1280 },
  { id: 4, src: momento4, alt: "Drix y Llely — momento 4", width: 1050, height: 1400 },
  { id: 5, src: momento5, alt: "Drix y Llely — momento 5", width: 960,  height: 1280 },
  { id: 6, src: momento6, alt: "Drix y Llely — momento 6", width: 1400, height: 1050 },
];
