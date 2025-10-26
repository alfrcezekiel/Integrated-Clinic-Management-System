import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from "@tailwindcss/vite"
import path from "path"
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [
//     react(),
//     tailwindcss()
//   ],
//   server: {
//     historyApiFallback: true,
//     proxy: {
//       "/CMS":{
//         target: "http://localhost:7506",
//         changeOrigin: true,
//         secure: false,
//         ws: true,
//         rewrite: (path) => path.replace(/^\/CMS/, "")
//       }
//     }
//   },
//   resolve: {
//     alias: {
//       "isotope-layout": path.resolve(__dirname, "node_modules/isotope-layout/dist/isotope.pkgd.min.js"),
//     }
//   }
// })

export default defineConfig(({ mode }) => {
  loadEnv(mode, __dirname, "VITE_");

  const isProduction = mode === "production";

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      historyApiFallback: true,
      proxy: isProduction ? undefined : {
        "/CMS": {
          target: "http://localhost:7506",
          changeOrigin: true,
          secure: false,
          ws: true,
          rewrite: (path) => path.replace(/^\/CMS/, "")
        }
      }
    },
    build: {
      target: "es2020",
      sourcemap: !isProduction,
    }
  }

})
