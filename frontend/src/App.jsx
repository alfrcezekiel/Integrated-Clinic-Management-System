import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import { Navigate } from 'react-router-dom';
import PageNotAvailable from './pages/PageNotAvailable'
import Login from './pages/Login'
import About from './pages/About';

function App(){
  return(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/ICMS" replace />} />
        <Route path="ICMS" element={<Home />} />
        <Route path="login" element={<Login />} />
        <Route path="about" element={<About />} />
        <Route path="*" element={<PageNotAvailable />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App
