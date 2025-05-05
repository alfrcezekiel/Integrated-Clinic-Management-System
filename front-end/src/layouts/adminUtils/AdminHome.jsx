import AdminViewPatientRegisteredAccountCalendar from "./ViewAdminCalendar/AdminViewPatientRegisteredAccounts";

const AdminDashboardHome = () => {
    return (
        <div className="mt-12">
            <div className="bg-white p-4 rounded-lg shadow-md overflow-auto mb-4">
                <AdminViewPatientRegisteredAccountCalendar />
            </div>
        </div>
    );
}

export default AdminDashboardHome;