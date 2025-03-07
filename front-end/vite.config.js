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
        target: "http://localhost:5003",
        changeOrigin: true,
        secure: false,
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
