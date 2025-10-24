import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VITE_ENV = import.meta.env.VITE_ENV || 'development'
const BASE_API_URL = import.meta.env.VITE_BASE_API_URL || 'http://localhost:7506'


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    historyApiFallback: true,
    proxy: {
      "/CMS":{
        target: VITE_ENV === "production" ? BASE_API_URL : "http://localhost:7506",
        changeOrigin: true,
        secure: VITE_ENV === "production",
        ws: true,
        rewrite: (path) => path.replace(/^\/CMS/, "")
      }
    }
  },
  resolve: {
    alias: {
      "isotope-layout": path.resolve(__dirname, "node_modules/isotope-layout/dist/isotope.pkgd.min.js"),
    }
  }
})
