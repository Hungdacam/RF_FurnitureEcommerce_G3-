import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/products': {
        target: 'http://localhost:8810', // URL của Product Catalog Service
        changeOrigin: true,
      },
    },
  },
})
