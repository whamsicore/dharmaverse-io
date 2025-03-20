import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 3000,
    host: true
  },
  preview: {
    port: Number(process.env.PORT) || 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 