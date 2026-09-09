import type { User } from 'firebase/auth';
import { getApp, isFirebaseConfigured, FirebaseNotConfiguredError } from './firebase';

/**
 * Autenticación real para el panel de invitados.
 *
 * Sustituye a la contraseña que vivía en el código: cualquier contraseña en el
 * frontend acaba dentro del bundle que descarga el navegador y se lee con las
 * DevTools. Aquí quien decide es Firebase Auth, y las reglas de Firestore
 * (firestore.rules) solo permiten leer la lista completa a una sesión válida.
 */

let authPromise: Promise<import('firebase/auth').Auth> | null = null;

const getAuthInstance = () => {
  if (!isFirebaseConfigured) return Promise.reject(new FirebaseNotConfiguredError());

  authPromise ??= (async () => {
    const { getAuth, setPersistence, browserLocalPersistence } = await import('firebase/auth');
    const auth = getAuth(await getApp());
    // La sesión sobrevive al cierre de la pestaña: los novios no tienen que
    // volver a entrar cada vez que abren el panel.
    await setPersistence(auth, browserLocalPersistence);
    return auth;
  })();
  return authPromise;
};

export type AuthUser = Pick<User, 'uid' | 'email'>;

/** Mensajes en español para los códigos de error de Firebase Auth. */
function describeAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-email':
      return 'El correo no tiene un formato válido.';
    case 'auth/user-disabled':
      return 'Esta cuenta está deshabilitada.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.';
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Espera unos minutos e inténtalo de nuevo.';
    case 'auth/network-request-failed':
      return 'Sin conexión. Revisa tu internet.';
    case 'auth/operation-not-allowed':
      return 'Falta habilitar el acceso por correo y contraseña en la consola de Firebase.';
    default:
      return 'No se pudo iniciar sesión. Inténtalo de nuevo.';
  }
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

export async function signIn(email: string, password: string): Promise<void> {
  try {
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    await signInWithEmailAndPassword(await getAuthInstance(), email.trim(), password);
  } catch (error) {
    if (error instanceof FirebaseNotConfiguredError) {
      throw new AuthError('Firebase no está configurado. Falta el archivo .env.');
    }
    const code = (error as { code?: string })?.code ?? '';
    throw new AuthError(describeAuthError(code));
  }
}

export async function signOut(): Promise<void> {
  const { signOut: fbSignOut } = await import('firebase/auth');
  await fbSignOut(await getAuthInstance());
}

/**
 * Avisa de cada cambio de sesión y devuelve la función para cancelar la
 * suscripción. Llama al callback con `null` si Firebase no está configurado,
 * para que la interfaz no se quede esperando indefinidamente.
 */
export function onAuthChange(callback: (user: AuthUser | null) => void): () => void {
  let unsubscribe: (() => void) | null = null;
  let cancelled = false;

  (async () => {
    try {
      const { onAuthStateChanged } = await import('firebase/auth');
      const auth = await getAuthInstance();
      if (cancelled) return;
      unsubscribe = onAuthStateChanged(auth, user =>
        callback(user ? { uid: user.uid, email: user.email } : null)
      );
    } catch {
      if (!cancelled) callback(null);
    }
  })();

  return () => {
    cancelled = true;
    unsubscribe?.();
  };
}
