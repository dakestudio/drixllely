import { StoryEvent, EventDetail, GalleryImage } from './types';

import primerEncuentroImg from '@/assets/story/primer-encuentro.webp';
import primerViajeImg from '@/assets/story/primer-viaje.webp';
import propuestaImg from '@/assets/story/propuesta.webp';

import momento1 from '@/assets/gallery/momento-1.webp';
import momento2 from '@/assets/gallery/momento-2.webp';
import momento3 from '@/assets/gallery/momento-3.webp';
import momento4 from '@/assets/gallery/momento-4.webp';
import momento5 from '@/assets/gallery/momento-5.webp';
import momento6 from '@/assets/gallery/momento-6.webp';

export const WEDDING_DATE = "2026-12-18T16:00:00";

export const COUPLE_NAMES = {
  bride: "Drix",
  groom: "Llely"
};

export const STORY_DATA: StoryEvent[] = [
  {
    id: 1,
    year: "2018",
    title: "El Primer Encuentro",
    description: "Nos conocimos en una pequeña cafetería del centro. Una coincidencia, un café derramado y una risa compartida marcaron el inicio de todo.",
    image: primerEncuentroImg
  },
  {
    id: 2,
    year: "2020",
    title: "Nuestro Primer Viaje",
    description: "Decidimos escapar juntos por primera vez. Entre paisajes nuevos y caminos desconocidos, descubrimos que juntos cualquier destino se siente como hogar.",
    image: primerViajeImg
  },
  {
    id: 3,
    year: "2025",
    title: "El 'Sí' Quiero",
    description: "Bajo un atardecer inolvidable en la playa, Alejandro hizo la pregunta y Sofia dijo que sí sin dudarlo.",
    image: propuestaImg
  }
];

export const EVENTS: {  reception: EventDetail } = {
 
  reception: {
    title: "Recepción & Fiesta",
    date: "18 de diciembre, 2026",
    time: "16:00 HRS",
    locationName: "Salón Julis ",
    address: "Eje 6 Sur Trabajadoras Sociales 1000, San Pedro, Iztapalapa, 09000 Ciudad de México, CDMX ",
    mapLink: "https://maps.app.goo.gl/ujvSA4Wb5tUdF3Ph7 "
  }
};

export const GALLERY_IMAGES: GalleryImage[] = [
  { id: 1, src: momento1, alt: "Momento 1" },
  { id: 2, src: momento2, alt: "Momento 2" },
  { id: 3, src: momento3, alt: "Momento 3" },
  { id: 4, src: momento4, alt: "Momento 4" },
  { id: 5, src: momento5, alt: "Momento 5" },
  { id: 6, src: momento6, alt: "Momento 6" },
];