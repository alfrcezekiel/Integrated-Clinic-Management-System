import {useEffect, useState} from "react";
import DoctorsDashboardNavbar from "../../../layouts/ClinicUtils/doctor.navbar";
import {Outlet, useLocation, Routes, Route} from "react-router-dom";
import DoctorsSideNav from "../../../layouts/ClinicUtils/DoctorsSideNav";
import { doctorRoutes } from "../../../routes";
import CMS from "../../../API/CMS";
import { useNavigate } from "react-router-dom";

const DoctorsDashboard = () => {
    const location = useLocation();
    const clinicName = localStorage.getItem("scn");
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState(null);

    useEffect(() => {
        const doctorTitleHeader = () => {
            document.title = "Doctor's Dashboard | CMS"
        }
        doctorTitleHeader();
        
        const navigateBackToHome = () => navigate("/cms");
        const fetchUserSession = async () => {
            try {
                const response = await CMS.get("CMS/retrieveSession", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (response.status === 200) {
                    setUserSession(response.data.sid);
                } else {
                    console.error("Error fetching user session data");
                }
            } catch (error) {
                console.error(`Code functionality error for fetching user session: ${error}`);
                if (error.response && error.response.status === 401) {
                    navigateBackToHome();
                } else {
                    console.error("Error fetching user session data:", error);
                }
            }
        }
        fetchUserSession();
    }, [location.pathname, navigate]);

    return (
        userSession && (
            <>
                <div className="min-h-screen bg-blue-gray-50/50">
                    <DoctorsSideNav routes={doctorRoutes} brandName={clinicName} />
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
            </>
        )
    );
}

export default DoctorsDashboard;