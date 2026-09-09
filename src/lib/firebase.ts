import type { FirebaseApp } from 'firebase/app';
import type { Firestore } from 'firebase/firestore';
import type { Invitado } from '@/types';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.projectId
);

/**
 * The Firebase SDK is ~86 kB gzipped — a third of the whole bundle. Loading it
 * lazily keeps it out of the critical path: it only arrives when a guest opens
 * a personal RSVP link (?invite=…) or the admin panel.
 */
let appPromise: Promise<FirebaseApp> | null = null;
let dbPromise: Promise<Firestore> | null = null;

/**
 * Instancia única de la app, compartida por Firestore y por Auth: crear dos
 * apps distintas haría que las reglas no vieran la sesión iniciada.
 */
export const getApp = (): Promise<FirebaseApp> => {
  // Sin credenciales, Firestore NO falla: reintenta la conexión para siempre y
  // la promesa nunca se resuelve. Cortamos aquí para que el error sea visible.
  if (!isFirebaseConfigured) {
    return Promise.reject(new FirebaseNotConfiguredError());
  }

  appPromise ??= (async () => {
    const { initializeApp } = await import('firebase/app');
    return initializeApp(firebaseConfig);
  })();
  return appPromise;
};

const getDb = (): Promise<Firestore> => {
  dbPromise ??= (async () => {
    const { getFirestore } = await import('firebase/firestore');
    return getFirestore(await getApp());
  })();
  return dbPromise;
};

/** Thrown when Firestore is unreachable, so callers can tell it apart from "not found". */
export class FirebaseUnavailableError extends Error {
  constructor(cause?: unknown) {
    super('No se pudo conectar con la base de datos');
    this.name = 'FirebaseUnavailableError';
    this.cause = cause;
  }
}

/** Thrown when the VITE_FIREBASE_* variables are missing (no .env). */
export class FirebaseNotConfiguredError extends Error {
  constructor() {
    super('Firebase no está configurado: falta el archivo .env');
    this.name = 'FirebaseNotConfiguredError';
  }
}

/**
 * Firestore reintenta de forma indefinida cuando no hay red o el proyecto no
 * existe, así que sin este límite la interfaz se queda cargando para siempre.
 */
const TIMEOUT_MS = 15_000;

function withTimeout<T>(operation: Promise<T>): Promise<T> {
  return Promise.race([
    operation,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new FirebaseUnavailableError('timeout')), TIMEOUT_MS)
    ),
  ]);
}

// ─── RSVP Functions ───────────────────────────────────────

/**
 * Fetch an invitado by their unique invite code.
 * Returns null when the code genuinely does not exist; throws
 * FirebaseUnavailableError when the lookup itself failed.
 */
export async function getInvitado(code: string): Promise<Invitado | null> {
  try {
    const { doc, getDoc } = await import('firebase/firestore');
    const snap = await withTimeout(getDoc(doc(await getDb(), 'invitados', code)));
    return snap.exists() ? ({ id: snap.id, ...snap.data() } as Invitado) : null;
  } catch (error) {
    console.error('Error fetching invitado:', error);
    throw new FirebaseUnavailableError(error);
  }
}

/** Update RSVP response for an invitado. Throws if the write did not land. */
export async function updateRSVP(code: string, data: Partial<Invitado>): Promise<void> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    await withTimeout(
      updateDoc(doc(await getDb(), 'invitados', code), {
        ...data,
        confirmado: true,
        fechaConfirmacion: new Date().toISOString(),
      })
    );
  } catch (error) {
    console.error('Error updating RSVP:', error);
    throw new FirebaseUnavailableError(error);
  }
}

// ─── Admin Functions ──────────────────────────────────────

/**
 * Get all invitados. Lanza en vez de devolver [] para que el panel pueda
 * distinguir "todavía no hay invitados" de "no se pudo leer la base".
 */
export async function getAllInvitados(): Promise<Invitado[]> {
  const { collection, getDocs } = await import('firebase/firestore');
  const snap = await withTimeout(getDocs(collection(await getDb(), 'invitados')));
  return snap.docs.map(d => ({ id: d.id, ...d.data() })) as Invitado[];
}

/** Create a new invitado */
export async function createInvitado(code: string, data: Omit<Invitado, 'id'>): Promise<boolean> {
  try {
    const { doc, setDoc } = await import('firebase/firestore');
    await withTimeout(setDoc(doc(await getDb(), 'invitados', code), data));
    return true;
  } catch (error) {
    console.error('Error creating invitado:', error);
    return false;
  }
}

/** Update an invitado (Admin) */
export async function updateInvitadoAdmin(code: string, data: Partial<Invitado>): Promise<boolean> {
  try {
    const { doc, updateDoc } = await import('firebase/firestore');
    await withTimeout(updateDoc(doc(await getDb(), 'invitados', code), data));
    return true;
  } catch (error) {
    console.error('Error updating invitado (Admin):', error);
    return false;
  }
}

/** Delete an invitado */
export async function deleteInvitado(code: string): Promise<boolean> {
  try {
    const { doc, deleteDoc } = await import('firebase/firestore');
    await withTimeout(deleteDoc(doc(await getDb(), 'invitados', code)));
    return true;
  } catch (error) {
    console.error('Error deleting invitado:', error);
    return false;
  }
}
