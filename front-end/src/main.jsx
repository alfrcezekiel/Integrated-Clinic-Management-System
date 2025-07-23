import { createRoot } from 'react-dom/client'
import App from './App'
import { MaterialUIProvider } from './context'
import { Provider } from "react-redux";
import { store } from "./app/store";

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
    <MaterialUIProvider>
      <App />
    </MaterialUIProvider>
  </Provider>
)
