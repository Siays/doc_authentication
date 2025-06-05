/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const baseURL = env.VITE_FAST_API_BASE_URL;

  return {
    plugins: [react(),
      tailwindcss(),
    ],
    server: {
      open: '/',
      proxy: {
        '/static': {
          target: baseURL,
          changeOrigin: true,
        },
        '/download': {
          target: baseURL,
          changeOrigin: true,
        },
        '/view': {
          target: baseURL,
          changeOrigin: true,
        },
        '/profile-pics': {
          target: baseURL,
          changeOrigin: true,
        },
      },
    },
  };
});
