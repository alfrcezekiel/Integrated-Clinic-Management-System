import { lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Route, Routes, Navigate, useLocation, BrowserRouter } from "react-router-dom";
import PageNotFound from './components/pageNotFound/error.jsx';
import Loader from "./components/Loader/Loader.jsx";

const Home = lazy(() => import("./components/MainContent.jsx"));
const PatientRegistrationPortal = lazy(() => import("./components/pages/PatientsRegistrationPage.jsx"));
const PatientsLoginPortal = lazy(() => import("./components/pages/PatientsLoginPage.jsx"));
const PatientsDashboard = lazy(() => import("./components/pages/dashboard/PatientsDashboard.jsx"));
const ClinicLoginPortal = lazy(() => import("./components/pages/ClinicLoginPage.jsx"));
const ClinicDashboard = lazy(() => import("./components/pages/dashboard/ClinicDashboard.jsx"));
const AdminLoginPortal = lazy(() => import("./components/pages/AdminLoginPage.jsx"));
const AdminDashboard = lazy(() => import("./components/pages/dashboard/AdminDashboard.jsx"));

const RouteLoader = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const scrollY = window.scrollY;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflow = 'hidden';
    document.body.style.width = '100%';

    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false)
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
    }, 2000);
    return () => {
      clearTimeout(timer);
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.overflow = '';
      document.body.style.width = '';
      window.scrollTo(0, scrollY);
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
      <BrowserRouter future={{ v7_startTransition: true }}>
        <RouteLoader>
          <Routes>
            <Route path="/" element={<Navigate to={"/cms"} replace />} />
            <Route path="/cms" element={<Home />} />
            <Route path="/patients-portal" element={<PatientRegistrationPortal />} />
            <Route path="/patients-login" element={<PatientsLoginPortal />} />
            <Route path="/cms/login-admin" element={<AdminLoginPortal />} />
            <Route path="/patients-dashboard/*" element={<PatientsDashboard />} />
            <Route path="/doctor-portal/login" element={<ClinicLoginPortal />} />
            <Route path="/doctor-portal/dashboard/*" element={<ClinicDashboard />} />
            <Route path="/admin-dashboard/*" element={<AdminDashboard />} />
            <Route path="*" element={<PageNotFound />} />
          </Routes>
        </RouteLoader>
      </BrowserRouter>
    </>
  )
}

export default App;