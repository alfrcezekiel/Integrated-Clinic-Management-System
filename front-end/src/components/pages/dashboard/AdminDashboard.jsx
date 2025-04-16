import {useEffect} from "react";
import {useLocation, Outlet, Route, Routes} from "react-router-dom";
import AdminDashboardNavbar from "../../../layouts/adminUtils/adminNavBar";
import AdminSideNav from "../../../layouts/adminUtils/AdminSideNav";
import { adminRoutes } from "../../../routes";

const AdminDashboard = () => {
    const location = useLocation();
    useEffect(() => {
        const titleHeader = () => {
            document.title = "Admin's Dashboard | CMS";
        }
        titleHeader();
    }, [location.pathname])

    return (
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
    );
}

export default AdminDashboard;