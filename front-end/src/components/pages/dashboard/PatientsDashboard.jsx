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
    const navigate = useNavigate();

    const { token } = useAuthorization();

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

        if(tokenContext) {
            fetchUserSession();
        }
    }, [location.pathname, tokenContext, navigate]);

    return (
        <>
            {userSession ? (
                <Dashboard />
            ) : (
                null
            )}
        </>
    )
}

export default PatientsDashboard;