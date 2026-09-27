import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import FullReload from 'vite-plugin-full-reload';
import { fileURLToPath, URL } from 'node:url';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    FullReload(['src/**/*']),
  ],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  server: {
    watch: {
      usePolling: true,
      interval: 100,
    },
  },

  build: {
    chunkSizeWarningLimit: 600,

    // ⭐ Rolldown syntax — ใช้ advancedChunks
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
