import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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
        target: import.meta.env.VITE_ENV === "production" ? import.meta.env.VITE_BASE_API_URL : "http://localhost:7506",
        changeOrigin: true,
        secure: import.meta.env.VITE_ENV === "production",
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
