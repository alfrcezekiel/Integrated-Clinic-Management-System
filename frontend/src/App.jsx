import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Navigate } from 'react-router-dom';
import React, {lazy, Suspense} from "react";
import './App.css';

const Home = lazy(() => import('./pages/Home'));
const About = lazy(() => import('./pages/About'));
const Login = lazy(() => import('./pages/Login'));
const PageNotAvailable = lazy(() => import('./pages/PageNotAvailable'));

function App(){
  return(
    <BrowserRouter>
      <Suspense fallback={<Loading/>}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="ICMS" index element={<Home/>} />
          <Route path="login" element={<Login/>} />
          <Route path="about" element={<About/>} />
          <Route path="*" element={<PageNotAvailable/>} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

function Loading() {
  return (
    <center>
      <h1>🌀 Loading...</h1>;
    </center>
  )
}

export default App
