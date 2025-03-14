import {useEffect} from "react";
import "../../../assets/css/main.css";
import DoctorsDashboardNavbar from "../../../layouts/doctor-utils/doctor.navbar";
import {Outlet, useLocation, Routes, Route} from "react-router-dom";
import DoctorsSideNav from "../../../layouts/doctor-utils/DoctorsSideNav";
import { doctorRoutes } from "../../../routes";
const DoctorsDashboard = () => {
    const location = useLocation();
    useEffect(() => {
        const doctorTitleHeader = () => {
            document.title = "Doctor's Dashboard | CMS"
        }
        doctorTitleHeader();
    }, [location.pathname]);

    return (
        <div className="min-h-screen bg-blue-gray-50/50">
            <DoctorsSideNav routes={doctorRoutes} brandName="Doctor's Dashboard" />
            <div className="p-4 flex-1 xl:ml-80">
                <DoctorsDashboardNavbar/>
                <Outlet/>
                <Routes>
                    {doctorRoutes.flatMap((layout) => 
                        layout.pages.map((page) => (
                            <Route
                                key={page.id}
                                element={page.element}
                                path={page.path}
                            />
                        ))
                    )}
                </Routes>
            </div>
        </div>
    );
}

export default DoctorsDashboard;    