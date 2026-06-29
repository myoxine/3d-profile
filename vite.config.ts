import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Pisahkan three.js (besar & jarang berubah) ke chunk vendor sendiri
        // agar bisa di-cache browser terpisah dari kode aplikasi yang sering berubah.
        manualChunks: {
          three: ['three'],
        },
      },
    },
  },
})
