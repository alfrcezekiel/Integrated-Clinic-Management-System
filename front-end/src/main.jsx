import { createRoot } from 'react-dom/client'
import App from './App'
import { MaterialUIProvider } from './context'

createRoot(document.getElementById('root')).render(
  <MaterialUIProvider>
    <App />
  </MaterialUIProvider>
)
