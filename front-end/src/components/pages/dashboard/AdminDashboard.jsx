import {useEffect, useState} from "react";
import {useLocation, Outlet, Route, Routes, useNavigate} from "react-router-dom";
import AdminDashboardNavbar from "../../../layouts/adminUtils/adminNavBar";
import AdminSideNav from "../../../layouts/adminUtils/AdminSideNav";
import { adminRoutes } from "../../../routes";
import CMS from "../../../API/CMS";
const AdminDashboard = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [userSession, setUserSession] = useState(null);

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Admin's Dashboard | CMS";
        }
        titleHeader();
        const navigateBackToHome = () => navigate("/cms");
        const fetchUserSession = async () => {
            try {
                const response = await CMS.get("CMS/retrieveSession", {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "application/json",
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
        fetchUserSession();
    }, [location.pathname, navigate])

    return (
        userSession && (
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