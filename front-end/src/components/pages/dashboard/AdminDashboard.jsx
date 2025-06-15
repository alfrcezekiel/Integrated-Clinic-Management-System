import { useEffect, useState } from "react";
import { useLocation, Outlet, Route, Routes, useNavigate } from "react-router-dom";
import AdminDashboardNavbar from "../../../layouts/adminUtils/adminNavBar";
import AdminSideNav from "../../../layouts/adminUtils/AdminSideNav";
import { adminRoutes } from "../../../routes";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState(null);
    const { login, token } = useAuthorization();
    const [confirmToken, setConfirmToken] = useState(null);

    const tokenContext = token;
    useEffect(() => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            navigate("/cms");
        }
    }, [tokenContext, navigate])

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Admin's Dashboard | CMS";
        }
        titleHeader();
        const navigateBackToHome = () => navigate("/cms");

        /**
         * @description function to fetch the user session data
         */
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

        /**
         * @description function to confirm the verification token
         */
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
            } catch (error) {
                console.error(`Error in confirmed token verification: ${error}`);
                if (error.response && error.response.status === 401) {
                    navigateBackToHome();
                }
            }
        }

        /**
         * @description function to refresh a new access token when the token is expired
         */
        const refreshAccessToken = async () => {
            try {
                const refreshTokenResponse = await CMS.get("/CMS/refreshAccessToken", {
                    withCredentials: true
                })

                if (refreshTokenResponse.status === 200) {
                    const newAccessToken = refreshTokenResponse.data.accessToken;
                    login(newAccessToken);
                } else {
                    throw new Error(`Failed to refresh access token: ${refreshTokenResponse.status}`);
                }
            } catch (error) {
                console.error(`Error in refreshing access token: ${error}`);
                if (error.response && error.response.status === 401) {
                    navigateBackToHome();
                }
            }
        }
        
        if (tokenContext) {
            fetchUserSession();
            confirmedTokenVerification();
        }

        /**
         * @var tokenExpirationTime
         * @description the time interval for the access token to expire
         */
        const tokenExpirationTime = 15 * 60 * 1000; // 15 minutes

        const interval = setInterval(() => {
            refreshAccessToken();
        }, tokenExpirationTime);

        return () => clearInterval(interval);
    }, [location.pathname, navigate, tokenContext, login])

    return (
        userSession && confirmToken && (
            <>
                <div className="min-h-screen bg-blue-gray-50/50">
                    <AdminSideNav routes={adminRoutes} brandName="Admin Dashboard | CMS" />
                    <div className="p-4 flex-1 xl:ml-80">
                        <AdminDashboardNavbar />
                        <Outlet />
                        <Routes>
                            {adminRoutes.flatMap((layout) =>
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

export default AdminDashboard;