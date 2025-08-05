import { useEffect, useState, useCallback } from "react";
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
import { removeLocalStorage } from "../../../utils/storage/localStorage.js";

const DoctorsDashboard = () => {
    const { user, token, login } = useAuthorization();
    const location = useLocation();
    const clinicName = user?.scn || localStorage.getItem("scn");
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState(null);
    const [confirmToken, setConfirmToken] = useState(null);
    const tokenContext = token || localStorage.getItem("authToken");
    const [lastActivity, setLastActivity] = useState(Date.now());
    const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
    const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes

    // Track user activity
    const updateLastActivity = useCallback(() => {
        setLastActivity((prevActivity) => {
            if (Date.now() - prevActivity > 1000) {
                return Date.now()
            }
            return prevActivity;
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
        const eventHandlers = []
        events.forEach(event => {
            const handler = () => updateLastActivity();
            window.addEventListener(event, handler, {passive: true});
            eventHandlers.push({event, handler});
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
            eventHandlers.forEach(({event, handler}) => {
                window.removeEventListener(event, handler);
            });
            clearInterval(activityCheckInterval);
            if (tokenExpirationCleanup) tokenExpirationCleanup();
        };
    }, [updateLastActivity, tokenContext, lastActivity, navigateBackToHome, ACTIVITY_CHECK_INTERVAL, SESSION_TIMEOUT]);

    useEffect(() => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            navigateBackToHome();
            return;
        }
    }, [tokenContext, navigateBackToHome]);

    useEffect(() => {
        document.title = "Clinic Dashboard | CMS"

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

        // funnction to refresh a new access token when the token is expired
        const refreshAccessToken = async (retryCount = 0) => {
            const MAX_RETRIES = 1
            const RETRY_DELAYS = 1000;
            try {
                const refreshResponse = await CMS.get(`CMS/refreshAccessToken`, {
                    withCredentials: true,
                    headers: {
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache"
                    }
                })

                if (refreshResponse.status === 200 && refreshResponse.data?.accessToken) {
                    const newAccessToken = refreshResponse.data.accessToken;
                    login(newAccessToken);
                } else {
                    throw new Error(`Error refreshing access token: ${refreshResponse.status}`);
                }
            } catch (error) {
                console.log(`Error in refreshing access token: ${error}`);
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
             * set to 55 minutes token expiration time
             */
            const tokenExpirationTime = 55 * 60 * 1000;

            const interval = setInterval(() => {
                refreshAccessToken();
            }, tokenExpirationTime);

            return () => clearInterval(interval);
        }

    }, [location.pathname, navigate, tokenContext, login, navigateBackToHome]);

    return (
        userSession && confirmToken && (
            <>
                <div className="min-h-screen bg-white">
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