import { lazy } from 'react'
import PropTypes from 'prop-types';
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom"
import PageNotFound from './components/pageNotFound/error.jsx'
import { useEffect, useState } from "react"
import Loader from "./components/Loader/Loader.jsx"

const Home = lazy(() => import("./components/MainContent.jsx"));
const PatientRegistrationPortal = lazy(() => import("./components/pages/PatientsRegistrationPage.jsx"));
const PatientsLoginPortal = lazy(() => import("./components/pages/PatientsLoginPage.jsx"))
const PatientsDashboard = lazy(() => import("./components/pages/dashboard/PatientsDashboard.jsx"))

const RouteLoader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.overflow = "hidden";

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false)
      document.body.style.overflow = "auto";
      window.scrollTo(0, scrollY);
    }, 2000);
    return () => {
      clearTimeout(timer);
    }
  }, [location.pathname])

  return (
    <>
      {loading && <Loader />}
      {children}
    </>
  )
}

RouteLoader.propTypes = {
  children: PropTypes.node.isRequired,
};

function App() {
  return (
    <>
      <BrowserRouter>
          <RouteLoader>
            <Routes>
              <Route path="/" element={<Navigate to={"/cms"} replace />} />
              <Route path="/cms" element={<Home />} />
              <Route path="/patients-portal" element={<PatientRegistrationPortal />} />
              <Route path="/patients-login" element={<PatientsLoginPortal />} />
              <Route path="/patients-dashboard/home" element={<PatientsDashboard />} />
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </RouteLoader>
      </BrowserRouter>
    </>
  )
}

export default App;