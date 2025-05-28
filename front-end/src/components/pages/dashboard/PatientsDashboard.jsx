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

const PatientsDashboard = () => {
    const location = useLocation();
    const [userSession, setUserSession] = useState(null);
    const navigate = useNavigate();

    
    useEffect(() => {
        const navigateBackToHome = () => navigate("/cms");
        const titleHead = () => document.title = "Patients Dashboard | CMS";
        titleHead();

        const fetchUserSession = async () => {
            try {
                const response = await CMS.get("CMS/retrieveSession", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    },
                });

                if (response.status === 200) {
                    setUserSession(response.data.sid);
                } else {
                    setUserSession(null);
                    console.error("Error fetching user session data");
                }
            } catch (error) {
                setUserSession(null);
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
        <>
            {userSession ? (
                <Dashboard/>
            ) : (
                null
            )}
        </>
    )
}

export default PatientsDashboard;