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
    const { user, token, login } = useAuthorization();
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

        // function to retrieve the clinic session data after logged in
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

        // function to confirm the verification token
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

        // funnction to refresh a new access token when the token is expired
        const refreshAccessToken = async () => {
            try {
                const refreshResponse = await CMS.get(`CMS/refreshAccessToken`, {
                    withCredentials: true,
                })

                if(refreshResponse.status === 200){
                    const newAccessToken = refreshResponse.data.accessToken;
                    login(newAccessToken);
                }
            } catch (error) {
                console.log(`Error in refreshing access token: ${error}`);
                if(error.response && error.response.status === 401) {
                    navigateBackToHome();
                }
            }
        }
        
        if (tokenContext) {
            fetchUserSession();
            confirmedTokenVerification();
        }

        /**
         * set to 1 hour token expiration time
         */
        const tokenExpirationTime = 60 * 60 * 1000;

        const interval = setInterval(() => {
            refreshAccessToken();
        }, tokenExpirationTime);

        return () => clearInterval(interval);
    }, [location.pathname, navigate, tokenContext, login]);

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