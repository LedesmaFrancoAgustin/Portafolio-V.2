import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // El CDN del hosting (hcdn) reencodea los PNG servidos como archivo: el sprite de la
    // mascota llegaba reducido a 1600×15 (en vez de 2535×24) y se veía borroso. Embebido
    // como data URI no pasa por el CDN.
    assetsInlineLimit: 16 * 1024, // el sprite pesa ~14 KB
  },
})
