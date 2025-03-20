import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: Number(process.env.PORT) || 3000,
    host: true,
    allowedHosts: ["dharmaverse.io", "www.dharmaverse.io"]
  },
  preview: {
    port: Number(process.env.PORT) || 3000,
    host: true,
    allowedHosts: ["dharmaverse.io", "www.dharmaverse.io"]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
}) 