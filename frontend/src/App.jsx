import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom';
import {lazy, Suspense} from "react";
import './App.css';
import Loader from "./components/Loader";

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const PageNotAvailable = lazy(() => import('./pages/PageNotAvailable'));
const Register = lazy(() => import('./pages/Register'));

function App(){
  return(
    <BrowserRouter>
      <Suspense fallback={<Loader/>}>
        <Routes>
          <Route path="/" element={<Navigate to="/ICMS" replace />} />
          <Route path="ICMS" index element={<Home/>} />
          <Route path="login" element={<Login/>} />
          <Route path="about" element={<About/>} />
          <Route path="register" element={<Register/>}/>
          <Route path="*" element={<PageNotAvailable/>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App
