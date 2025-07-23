import AdminViewPatientRegisteredAccountCalendar from "./ViewAdminCalendar/AdminViewPatientRegisteredAccounts";
import AdminStatsCards from "../../widgets/cards/admin_cards/AdminStatsCards";
const AdminDashboardHome = () => {
    return (
        <div className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <AdminStatsCards />
                </div>
                <div className="bg-white p-4 rounded-lg shadow-md">
                    <AdminViewPatientRegisteredAccountCalendar />
                </div>
            </div>
        </div>
    );
}

export default AdminDashboardHome;