import { useEffect, useState } from "react";
import DoctorsDashboardNavbar from "../../../layouts/ClinicUtils/ClinicNavigationBar";
import {
    useLocation,
    Routes,
    Route
} from "react-router-dom";
import DoctorsSideNav from "../../../layouts/ClinicUtils/ClinicSideNavigation";
import { doctorRoutes } from "../../../routes";
import CMS from "../../../API/CMS";
import { useNavigate } from "react-router-dom";
import { useAuthorization } from "../../../context/auth/useAuthorization.jsx";

const DoctorsDashboard = () => {
    const { user, token } = useAuthorization();
    const location = useLocation();
    const clinicName = user?.scn || localStorage.getItem("scn");
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState(null);
    const tokenContext = token || localStorage.getItem("authToken");

    useEffect(() => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            navigate("/cms");
        }
    }, [tokenContext, navigate]);

    useEffect(() => {
        const doctorTitleHeader = () => {
            document.title = "Clinic Dashboard | CMS"
        }
        doctorTitleHeader();

        const navigateBackToHome = () => navigate("/cms");
        const fetchUserSession = async () => {
            try {
                const response = await CMS.get("CMS/retrieveSession", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`
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
        
        if (tokenContext) {
            fetchUserSession();
        }
    }, [location.pathname, navigate, tokenContext]);

    return (
        userSession && (
            <>
                <div className="min-h-screen bg-blue-gray-50/50">
                    <DoctorsSideNav routes={doctorRoutes} brandName={clinicName} />
                    <div className="p-4 flex-1 xl:ml-80">
                        <DoctorsDashboardNavbar />
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