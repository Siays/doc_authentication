import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(),],
  server: {
    open: '/', // explicitly opens the root in browser
    proxy: {
      '/static': {
        target: 'http://127.0.0.1:8050',
        changeOrigin: true,
      },
      '/download': {
        target: 'http://127.0.0.1:8050',
        changeOrigin: true,
      },
      '/view': {
        target: 'http://127.0.0.1:8050',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    include: ['pdfjs-dist']
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'pdfjs-dist': ['pdfjs-dist']
        }
      }
    }
  },
})
