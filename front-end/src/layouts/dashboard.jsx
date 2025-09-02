import routes from "../routes";
import SideNav from "../widgets/layout/sidenav";
import DashboardNavbar from "../widgets/layout/dashboard.navbar";
import Footer from "../widgets/layout/footer";
import { Routes, Route } from "react-router-dom";

const Dashboard = () => {
    return (
        <div className="max-h-screen bg-white flex flex-col">
            <div className="flex flex-1">
                {/* this top component is for side nav */}
                <SideNav routes={routes} brandName="Patient Dashboard" />
                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0">
                    <div className="p-4 flex-1 xl:ml-65">
                        <DashboardNavbar />
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
                        <div className="text-center">
                            <Footer
                                brandName="Clinic Management System"
                                brandLink="https://clinicanagementsystem.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dashboard;