import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://api-gateway:8900',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/products': {
        target: 'http://product-catalog-service:8810',
        changeOrigin: true,
      }
    }
  }
})
