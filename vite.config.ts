import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // loadEnv trae el .env, .env.local y .env.[mode].local. El prefijo '' hace que
  // cargue también las variables que no empiezan con VITE_ (BFF_URL, GATEWAY_SECRET).
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    // Solo `npm run dev`. Con VITE_API_BASE='' el front llama a /api en su propio origen
    // y Vite lo reenvía al BFF local, agregando el secreto para las rutas protegidas.
    server: {
      proxy: {
        '/api': {
          target: env.BFF_URL ?? 'http://localhost:8080',
          headers: { 'X-Secret-Gateway': env.GATEWAY_SECRET ?? 'secreto_local' },
        },
      },
    },
  };
});
