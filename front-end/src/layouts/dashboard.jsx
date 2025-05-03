import routes from "../routes";
import SideNav from "../widgets/layout/sidenav";
import DashboardNavbar from "../widgets/layout/dashboard.navbar";
import Footer from "../widgets/layout/footer";
import { Routes, Route, Outlet } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-blue-gray-50/50">
            {/* this top component is for side nav */}
            <SideNav routes={routes} brandName="Patients Dashboard" />
            {/* Main Content */}
            <div className="p-4 flex-1 xl:ml-80">
                <DashboardNavbar />
                <Outlet />
                <Routes>
                    {routes.flatMap((layout) =>
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
            <div className="text-blue-gray-600">
                <Footer
                    brandName="Clinic Management System"
                    brandLink="https://clinicanagementsystem.com"
                />
            </div>
        </div>
    )
}

export default Dashboard;