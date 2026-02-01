import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), react()],
  base: '/AllTheMonsters/',
  build: {
    outDir: '../build',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: '/AllTheMonsters/',
  },
})
