import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  preview: {
    allowedHosts: ['all'],
  },
  resolve: {
    alias: [{ find: "@", replacement: "/src" }],
  },
  plugins: [react()],
  server: {
    port: 6273, 
    hmr: true,
  },
  optimizeDeps: {
    include: ['xlsx-js-style'],
  },
})
