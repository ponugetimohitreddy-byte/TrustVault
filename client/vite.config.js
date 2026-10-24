import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],

  // Expose VITE_API_URL to the client bundle (production only).
  // In development the dev-server proxy rewrites /api → localhost:5001
  // so VITE_API_URL is not needed locally.
  define: {
    __API_URL__: JSON.stringify(
      mode === 'production'
        ? (process.env.VITE_API_URL || '/api')
        : '/api'
    ),
  },

  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
}));

