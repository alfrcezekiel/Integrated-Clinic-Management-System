import Dashboard from "../../../layouts/dashboard";
import {
    useEffect,
    useState
} from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization.jsx";

import { useMemo } from "react";

const PatientsDashboard = () => {
    const location = useLocation();
    const [userSession, setUserSession] = useState(null);
    const [confirmToken, setConfirmToken] = useState(null);

    const navigate = useNavigate();

    const { token, login } = useAuthorization();

    const tokenContext = useMemo(() => token || localStorage.getItem("authToken"), [token]);
    
    useEffect(() => {
        if (!tokenContext) {
            console.error("No token found in context or localStorage");
            navigate("/cms");
        }
    }, [tokenContext, navigate]);

    useEffect(() => {
        const navigateBackToHome = () => {
            console.error("Unauthorized access, redirecting to home page");
            navigate("/cms")
        }

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
                    navigateBackToHome();
                }
            }
        }

        // funnction to refresh a new access token when the token is expired
        const refreshAccessToken = async (retryCount = 0) => {
            const MAX_RETRIES = 0;
            const RETRY_DELAY = 1000;
            try {

                const refreshResponse = await CMS.get(`CMS/refreshAccessToken`, {
                    withCredentials: true,
                    headers: {
                        "Cache-Control" : "no-cache",
                        "Pragma" : "no-cache"
                    }
                })

                if (refreshResponse.status === 200 && refreshResponse.data?.accessToken) {
                    const newAccessToken = refreshResponse.data.accessToken;
                    login(newAccessToken);
                    return true;
                } else {
                    throw new Error(`Error refreshing access token: ${refreshResponse.status}`);
                }
            } catch (error) {
                console.error(`Error in refreshing access token: ${error}`);
                if (error.response && error.response.status === 401) {
                    console.error(`Refresh acces token expired`)
                    navigateBackToHome();
                    return false;
                }

                if (retryCount < MAX_RETRIES) {
                    console.error(`Refresh access token failed, retrying...`)
                    await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
                    return refreshAccessToken(retryCount + 1);
                } else {
                    console.error(`Refresh access token failed, maximum retries reached`)
                    navigateBackToHome();
                    return false;
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
    }, [location.pathname, tokenContext, navigate, login]);

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