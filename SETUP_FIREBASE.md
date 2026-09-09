# Configuración de Firebase — Drix & Llely

Guía para dejar la base de datos y el acceso al panel funcionando desde cero.
Los pasos 1 a 5 se hacen en la consola de Firebase; el 6 en tu computadora.

---

## 1. Crear el proyecto

1. Entra a <https://console.firebase.google.com> y pulsa **Agregar proyecto**.
2. Nombre sugerido: `drixllely-boda`.
3. Google Analytics: **desactívalo**. No aporta nada aquí y simplifica el alta.

## 2. Crear la base de datos

1. Menú lateral → **Compilación → Firestore Database** → **Crear base de datos**.
2. Ubicación: **`nam5 (us-central)`** o la más cercana a México.
   ⚠️ La ubicación **no se puede cambiar** después.
3. Empieza en **modo de producción** (bloqueado). Las reglas correctas las
   publicamos en el paso 4.

## 3. Registrar la aplicación web

1. **⚙ Configuración del proyecto** → sección *Tus apps* → icono **`</>`** (Web).
2. Apodo: `Invitación web`. **No** marques Firebase Hosting (usan Vercel).
3. Copia el objeto `firebaseConfig` que aparece: son los valores del paso 6.

## 4. Publicar las reglas de seguridad

**Este es el paso que de verdad protege la lista de invitados.**

1. **Firestore Database** → pestaña **Reglas**.
2. Borra todo y pega el contenido completo del archivo [`firestore.rules`](./firestore.rules).
3. **Publicar**.

Lo que consigues con esas reglas:

| Quién | Puede | No puede |
|---|---|---|
| Invitado (sin sesión) | Leer su invitación con su código y confirmar asistencia | Ver la lista completa, cambiarse el nombre, darse pases extra, borrar nada |
| Novios (con sesión) | Todo: listar, crear, editar, borrar | — |

La regla clave es separar `get` (leer un documento cuyo código ya conoces) de
`list` (recorrer la colección entera). Sin esa separación, cualquiera podría
descargar la lista completa con los nombres y respuestas de todos los invitados.

## 5. Crear los usuarios del panel

1. **Compilación → Authentication** → **Comenzar**.
2. Pestaña **Sign-in method** → habilita **Correo electrónico/contraseña**.
   (Deja *Vínculo del correo electrónico* desactivado.)
3. Pestaña **Users** → **Agregar usuario**. Crea uno para cada persona que vaya
   a administrar la lista. Usa una contraseña larga y distinta de las de siempre.

> No hay registro público: los usuarios se crean solo aquí. Si alguien intenta
> entrar a `/admin` sin una cuenta creada por ustedes, no pasa.

## 6. Conectar el proyecto local

Crea un archivo `.env` en la raíz (junto a `package.json`) con los valores del
paso 3:

```bash
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=drixllely-boda.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=drixllely-boda
VITE_FIREBASE_STORAGE_BUCKET=drixllely-boda.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

Reinicia el servidor (`npm run dev`): Vite solo lee el `.env` al arrancar.

`.env` está en `.gitignore` y **no debe subirse**. Las mismas variables hay que
darlas de alta en **Vercel → Settings → Environment Variables**, o el sitio
desplegado seguirá sin base de datos.

---

## Comprobar que todo quedó bien

1. Abre `/admin`. Debe pedirte **correo y contraseña** (ya no la contraseña vieja).
2. Entra con el usuario del paso 5. Si el aviso rojo desaparece y ves la tabla
   vacía con *"No hay invitados aún"*, la conexión y las reglas funcionan.
3. Crea un invitado de prueba y copia su enlace.
4. Abre ese enlace **en una ventana de incógnito** (sin sesión) y confirma
   asistencia. Debe funcionar.
5. En esa misma ventana de incógnito, abre la consola del navegador y prueba a
   listar la colección. Debe fallar con `permission-denied` — esa es la señal de
   que la lista de invitados está protegida.

## Estructura de un invitado

La colección se llama `invitados` y el **ID del documento es el código de
invitación** (el que va en `?invite=XXXXXX`).

```js
{
  nombre: "Familia Pérez",        // Solo lo edita el panel
  maxInvitados: 4,                // Cupo máximo. Solo lo edita el panel
  confirmado: false,
  asistira: null,                 // 'yes' | 'no'
  numInvitados: 0,                // Nunca puede superar maxInvitados
  nombresAcompanantes: [],
  tieneRestricciones: null,
  restricciones: "",
  mensaje: "",
  fechaConfirmacion: ""           // ISO, lo escribe la web al confirmar
}
```

## Notas de seguridad

- **La clave `VITE_FIREBASE_API_KEY` es pública por diseño.** No es una
  contraseña: identifica al proyecto. Google la expone en todas las apps web.
  Lo que impide el abuso son las reglas de Firestore.
- **Nunca vuelvan a poner una contraseña en el código.** Todo lo que está en el
  frontend se lee con las DevTools. Por eso el panel ahora usa Firebase Auth.
- Si algún día publican el repositorio y les preocupa el gasto, activen
  **App Check** y un presupuesto con alerta en Google Cloud.
