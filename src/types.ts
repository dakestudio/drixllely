export interface EventDetail {
  title: string;
  date: string;
  time: string;
  locationName: string;
  address: string;
  mapLink: string;
}

export interface RSVPData {
  asistira: 'yes' | 'no' | null;
  numInvitados: number;
  nombresAcompanantes: string[];
  mensaje: string;
}

export interface Invitado {
  id: string;
  nombre: string;
  maxInvitados: number;
  confirmado: boolean;
  asistira: 'yes' | 'no' | null;
  numInvitados: number;
  nombresAcompanantes: string[];
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
