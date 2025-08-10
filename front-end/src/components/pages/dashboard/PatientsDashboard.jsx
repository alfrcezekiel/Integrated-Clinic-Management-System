import Dashboard from "../../../layouts/dashboard";
import {
    useEffect,
    useState,
    useCallback
} from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization.jsx";
import {removeLocalStorage } from "../../../utils/storage/localStorage.js";
import { useMemo } from "react";

const PatientsDashboard = () => {
    const location = useLocation();
    const [userSession, setUserSession] = useState(null);
    const [confirmToken, setConfirmToken] = useState(null);
    const navigate = useNavigate();
    const [lastActivity, setLastActivity] = useState(Date.now());
    const SESSION_TIMEOUT = 60 * 60 * 1000; // 1 hour in milliseconds
    const ACTIVITY_CHECK_INTERVAL = 5 * 60 * 1000; // Check every 5 minutes
    const { token, login } = useAuthorization();

    const tokenContext = useMemo(() => token || localStorage.getItem("authToken"), [token]);

    const updateLastActivity = useCallback(() => {
        setLastActivity((prevActivity) => {
            if (Date.now() - prevActivity > 1000) {
                return Date.now();
            }
            return prevActivity;
        })
    }, []);

    const navigateBackToHome = useCallback(() => {
        removeLocalStorage("authToken");
        removeLocalStorage("userData");
        navigate("/cms");
    }, [navigate]);

    useEffect(() => {
        /**
         * add events for user activity 
         */

        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            window.addEventListener(event, updateLastActivity);
        });

        /**
         * check session timeout periodically
         */

        const activityCheckInterval = setInterval(() => {
            const currentTime = Date.now();

            if (currentTime - lastActivity > SESSION_TIMEOUT) {
                console.log(`Session timeout due to inactivity`)
                navigateBackToHome();
            }
        }, ACTIVITY_CHECK_INTERVAL);

        /**
         * check token expiration
         */

        const checkTokenExpiration = () => {
            if (!tokenContext) return;

            try {
                const tokenPayload = JSON.parse(atob(tokenContext.split('.')[1]));
                const expirationTime = tokenPayload.exp * 1000;
                const currentTime = Date.now();

                if (currentTime > expirationTime) {
                    console.log(`Token has expired`);
                    navigateBackToHome();
                } else {
                    /**
                     * sets a timeout to check again when the token is about to expire
                     */

                    const timeUntilExpiry = expirationTime - currentTime;
                    const tokenExpirationTimeout = setTimeout(() => {
                        checkTokenExpiration();
                    }, Math.min(timeUntilExpiry, SESSION_TIMEOUT));

                    return () => clearTimeout(tokenExpirationTimeout);
                }
            } catch (error) {
                console.error(`Error checking token expiration: ${error}`)
                if (error.response && error.response.status === 401) {
                    navigateBackToHome();
                }
            }
        }

        /**
         * initial token expiration check
         */
        const tokenExpirationCleanup = checkTokenExpiration();

        /**
         * cleanup functtion to clear the events and intervals
         */

        return () => {
            events.forEach((event) => {
                window.removeEventListener(event, updateLastActivity);
            })
            clearInterval(activityCheckInterval);
            if (tokenExpirationCleanup) tokenExpirationCleanup();
        }
    }, [updateLastActivity, ACTIVITY_CHECK_INTERVAL, SESSION_TIMEOUT, lastActivity, navigateBackToHome, tokenContext])

    useEffect(() => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            navigateBackToHome();
            return;
        }
    }, [tokenContext, navigateBackToHome]);

    useEffect(() => {
        const titleHead = () => document.title = "Patient Dashboard | CMS";
        titleHead();

        const fetchUserSession = async () => {
            try {
                const response = await CMS.get("CMS/retrieveSession", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`,
                    },
                });

                if (response.status === 200) {
                    setUserSession(response.data.sid);
                } else {
                    setUserSession(null);
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
        };

        const confirmTokenVerification = async () => {
            try {
                const response = await CMS.get("/CMS/confirmVerificationToken", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`,
                    }
                })

                if (response.status === 200) {
                    const data = response.data.user;
                    setConfirmToken(data);
                } else {
                    throw new Error(`Failed to verify token: ${response.status}`);
                }
            } catch (error) {
                console.error(`Code functinality error in confirm token verification function: ${error}`)
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

        // funnction to refresh a new access token when the token is expired
        const refreshAccessToken = async (retryCount = 0) => {
            const MAX_RETRIES = 1;
            const RETRY_DELAY = 1000;
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
                console.error(`Error in refreshing access token: ${error}`);
                if (error.response && error.response.status === 401) {
                    console.error(`Refresh acces token expired`)
                    navigateBackToHome();
                }

                if (retryCount < MAX_RETRIES) {
                    console.error(`Refresh access token failed, retrying...`)
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
                    return refreshAccessToken(retryCount + 1);
                } else {
                    console.error(`Refresh access token failed, maximum retries reached`)
                    navigateBackToHome();
                }
            }
        }

        if (tokenContext) {
            fetchUserSession();
            confirmTokenVerification();

            const tokenExpirationTime = 55 * 60 * 1000; // 55 minutes

            const interval = setInterval(() => {
                refreshAccessToken();
            }, tokenExpirationTime);

            return () => clearInterval(interval);
        }
    }, [location.pathname, tokenContext, navigate, login, navigateBackToHome]);

    return (
        <>
            {userSession && confirmToken ? (
                <Dashboard />
            ) : (
                null
            )}
        </>
    )
}

export default PatientsDashboard;