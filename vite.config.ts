import { fileURLToPath } from 'url';
import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Los navegadores que soportan `100svh` y `fetchpriority` son los mismos
    // que cubre este target, así que no dejamos a nadie fuera.
    target: 'es2020',
    // Sin `manualChunks`: el reparto automático de Vite ya es mejor aquí. El
    // ahorro real viene de que Firebase se importa de forma dinámica en
    // src/lib/firebase.ts, así que sale solo del arranque.
  },
});
