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
    const [confirmToken, setConfirmToken] = useState(null);
    const tokenContext = token || localStorage.getItem("authToken");

    useEffect(() => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            navigate("/cms");
        }
    }, [tokenContext, navigate]);

    useEffect(() => {
        document.title = "Clinic Dashboard | CMS"

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

        const confirmedTokenVerification = async () => {
            try {
                const response = await CMS.get("/CMS/confirmVerificationToken", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.user;
                    setConfirmToken(data);
                } else {
                    throw new Error(`Failed to verify token: ${response.status}`);
                }
            } catch (jwtError) {
                console.error(`Code functionality error for JWT verification: ${jwtError}`);
                if (jwtError.response && jwtError.response.status === 401) {
                    navigateBackToHome();
                } else {
                    console.error("Error verifying JWT token:", jwtError);
                }
            }
        }

        if (tokenContext) {
            fetchUserSession();
            confirmedTokenVerification();
        }
    }, [location.pathname, navigate, tokenContext]);

    return (
        userSession && confirmToken && (
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