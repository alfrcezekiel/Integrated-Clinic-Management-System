import {
    useEffect,
    useState,
    useCallback
} from "react";
import {
    useLocation,
    Outlet,
    Route,
    Routes,
    useNavigate
} from "react-router-dom";
import AdminDashboardNavbar from "../../../layouts/adminUtils/adminNavBar";
import AdminSideNav from "../../../layouts/adminUtils/AdminSideNav";
import { adminRoutes } from "../../../routes";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";
import { removeLocalStorage } from "../../../utils/storage/localStorage";

const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState(null);
    const { login, token } = useAuthorization();
    const [confirmToken, setConfirmToken] = useState(null);
    const tokenContext = token || localStorage.getItem("authToken");
    const [lastActivity, setLastActivity] = useState(Date.now());
    const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
    const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

    // Track user activity
    const updateLastActivity = useCallback(() => {
        setLastActivity((prevActvity) => {
            if (Date.now() - prevActvity > 1000) {
                return Date.now();
            }
            return prevActvity;
        });
    }, []);

    const navigateBackToHome = useCallback(() => {
        removeLocalStorage("authToken");
        removeLocalStorage("userData");
        navigate("/cms");
    }, [navigate]);

    useEffect(() => {
        // Add event listeners for user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, updateLastActivity);
        });

        // Check session timeout periodically
        const activityCheckInterval = setInterval(() => {
            const currentTime = Date.now();
            if (currentTime - lastActivity > SESSION_TIMEOUT) {
                console.log('Session timeout due to inactivity');
                navigateBackToHome();
            }
        }, ACTIVITY_CHECK_INTERVAL);

        // Check token expiration
        const checkTokenExpiration = () => {
            if (!tokenContext) return;

            try {
                const tokenPayload = JSON.parse(atob(tokenContext.split('.')[1]));
                const expirationTime = tokenPayload.exp * 1000; // Convert to milliseconds
                const currentTime = Date.now();

                if (currentTime > expirationTime) {
                    console.log('Token has expired');
                    navigateBackToHome();
                } else {
                    // Set a timeout to check again when the token is about to expire
                    const timeUntilExpiry = expirationTime - currentTime;
                    const tokenExpirationTimeout = setTimeout(() => {
                        checkTokenExpiration();
                    }, Math.min(timeUntilExpiry, SESSION_TIMEOUT));

                    return () => clearTimeout(tokenExpirationTimeout);
                }
            } catch (error) {
                console.error('Error checking token expiration:', error);
                navigateBackToHome();
            }
        };

        // Initial token expiration check
        const tokenExpirationCleanup = checkTokenExpiration();

        // Cleanup function
        return () => {
            events.forEach(event => {
                window.removeEventListener(event, updateLastActivity);
            });
            clearInterval(activityCheckInterval);
            if (tokenExpirationCleanup) tokenExpirationCleanup();
        };
    }, [tokenContext, lastActivity, navigateBackToHome, ACTIVITY_CHECK_INTERVAL, SESSION_TIMEOUT, updateLastActivity]);

    useEffect(() => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            navigateBackToHome();
        }
    }, [tokenContext, navigateBackToHome])

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Admin's Dashboard | CMS";
        }
        titleHeader();

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
                    try {
                        await refreshAccessToken()
                    } catch (error) {
                        console.error(`Error refreshing access token: ${error}`)
                        navigateBackToHome();
                    }
                } else {
                    navigateBackToHome();
                }
            }
        }

        /**
         * @description function to refresh a new access token when the token is expired
         */
        const refreshAccessToken = async (retryCount = 0) => {
            const MAX_RETRIES = 1;
            const RETRY_DELAYS = 1000;
            try {
                const refreshTokenResponse = await CMS.get("/CMS/refreshAccessToken", {
                    withCredentials: true,
                    headers: {
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache"
                    }
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

                if (retryCount < MAX_RETRIES) {
                    console.error(`Refresh access token failed, retrying...`)
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS))
                    return refreshAccessToken(retryCount + 1);
                } else {
                    console.error(`Refresh access token failed, maximum retries reached`)
                    navigateBackToHome();
                }
            }
        }

        if (tokenContext) {
            fetchUserSession();
            confirmedTokenVerification();
            /**
             * @var tokenExpirationTime
             * @description the time interval for the access token to expire
             */
            const tokenExpirationTime = 55 * 60 * 1000; // 55 minutes

            const interval = setInterval(() => {
                refreshAccessToken();
            }, tokenExpirationTime);

            return () => clearInterval(interval);
        }

    }, [location.pathname, navigate, tokenContext, login, navigateBackToHome])

    return (
        userSession && confirmToken && (
            <>
                <div className="min-h-screen bg-white">
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