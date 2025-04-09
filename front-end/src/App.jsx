import { Suspense, lazy, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Route, Routes, Navigate, useLocation, BrowserRouter } from "react-router-dom";
import PageNotFound from './components/pageNotFound/error.jsx';
import Loader from "./components/Loader/Loader.jsx";

const Home = lazy(() => import("./components/MainContent.jsx"));
const PatientRegistrationPortal = lazy(() => import("./components/pages/PatientsRegistrationPage.jsx"));
const PatientsLoginPortal = lazy(() => import("./components/pages/PatientsLoginPage.jsx"));
const PatientsDashboard = lazy(() => import("./components/pages/dashboard/PatientsDashboard.jsx"));
const DoctorLoginPortal = lazy(() => import("./components/pages/DoctorLoginPage.jsx"));
const DoctorsDashboard = lazy(() => import("./components/pages/dashboard/DoctorsDashboard.jsx"));
const AdminLoginPortal = lazy(() => import("./components/pages/AdminLoginPage.jsx"));
const AdminDashboard = lazy(() => import("./components/pages/dashboard/AdminDashboard.jsx"));

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
      document.body.style.overflow = "auto";
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
      <BrowserRouter future={{v7_startTransition: true}}>
        <RouteLoader>
          <Suspense fallback={<Loader />}>
            <Routes>
              <Route path="/" element={<Navigate to={"/cms"} replace />} />
              <Route path="/cms" element={<Home />} />
              <Route path="/patients-portal" element={<PatientRegistrationPortal />} />
              <Route path="/patients-login" element={<PatientsLoginPortal />} />
              <Route path="/cms/login-admin" element={<AdminLoginPortal />}/>
              <Route path="/patients-dashboard/*" element={<PatientsDashboard />} />
              <Route path="/doctor-portal/login" element={<DoctorLoginPortal />} />
              <Route path="/doctor-portal/dashboard/*" element={<DoctorsDashboard/>} />
              <Route path="/admin-dashboard/*" element={<AdminDashboard />}/>
              <Route path="*" element={<PageNotFound />} />
            </Routes>
          </Suspense>
        </RouteLoader>
      </BrowserRouter>
    </>
  )
}

export default App;