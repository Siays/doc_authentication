/// <reference types="node" />
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  const baseURL = env.VITE_FAST_API_BASE_URL;
  // const wsURL = env.VITE_WEBSOCKET_URL;

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
        '/notifications':{
          target: baseURL,
          changeOrigin: true,
        }
        //WebSocket uses a different protocol than typical HTTP requests, and most development-time HTTP proxies 
        //are not designed to handle the WebSocket upgrade mechanism properly. This leads to issues when trying 
        //to proxy WebSocket connections using standard HTTP proxy configurations.*/}
        // '/ws': {
        //   target: wsURL,
        //   changeOrigin: true,
        //   ws: true,
        // },
      },
    },
  };
});
