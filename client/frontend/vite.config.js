import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
   theme: {
    extend: {
      fontFamily: {
        apple: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Display"', '"SF Pro Text"', 'sans-serif']
      },
      colors: {
        appleBlack: "#1D1D1F",
        appleGray: "#86868B",
        appleBlue: "#0071E3",
        appleBorder: "#D2D2D7"
      }
    },
  },
  plugins: [ tailwindcss(),react()],
})
