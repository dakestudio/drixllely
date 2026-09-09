export interface EventDetail {
  title: string;
  date: string;
  time: string;
  locationName: string;
  address: string;
  mapLink: string;
}

export interface RSVPData {
  telefono: string;
  asistira: 'yes' | 'no' | null;
  numInvitados: number;
  nombresAcompanantes: string[];
  tieneRestricciones: boolean | null;
  restricciones: string;
  mensaje: string;
}

export interface Invitado {
  id: string;
  nombre: string;
  maxInvitados: number;
  confirmado: boolean;
  asistira: 'yes' | 'no' | null;
  telefono: string;
  numInvitados: number;
  nombresAcompanantes: string[];
  tieneRestricciones: boolean | null;
  restricciones: string;
  mensaje: string;
  fechaConfirmacion?: string;
}

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  /** Intrinsic size, used to reserve layout space and avoid CLS. */
  width: number;
  height: number;
}

export interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}
