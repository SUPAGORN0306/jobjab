import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import FullReload from 'vite-plugin-full-reload';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // FullReload(['src/**/*']),
  ],

  resolve: {
    alias: {
      '@':           fileURLToPath(new URL('./src', import.meta.url)),
      '@api':        fileURLToPath(new URL('./src/utils/api.js', import.meta.url)),
      '@client':     fileURLToPath(new URL('./src/lib/apiClient.js', import.meta.url)),
      '@utils':      fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@lib':        fileURLToPath(new URL('./src/lib', import.meta.url)),
      '@hooks':      fileURLToPath(new URL('./src/hooks', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@context':    fileURLToPath(new URL('./src/context', import.meta.url)),
      '@pages':      fileURLToPath(new URL('./src/pages', import.meta.url)),
    },
  },

  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,
      interval: 1000,
    },
  },
  
  build: {
    chunkSizeWarningLimit: 600,

    // Rolldown syntax — ใช้ advancedChunks
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: 'react-vendor',
              test: /node_modules[\\/](react|react-dom|react-router-dom|scheduler)[\\/]/,
            },
            {
              name: 'charts',
              test: /node_modules[\\/](recharts|d3-|victory-)[\\/]/,
            },
            {
              name: 'ui-vendor',
              test: /node_modules[\\/](sonner|lucide-react|radix-ui|@radix-ui)[\\/]/,
            },
            {
              name: 'media-vendor',
              test: /node_modules[\\/](react-easy-crop|react-calendar|normalize-wheel)[\\/]/,
            },
          ],
        },
      },
    },
  },
});
