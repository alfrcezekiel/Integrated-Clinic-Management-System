import ClinicViewAppointmentCalendar from "../../../layouts/ClinicUtils/ViewClinicCalendar/ClinicViewAppointmentCalendar";
import ClinicStatsCards from "../../cards/clinic stats/ClinicStats";

const DoctorsDashboardHome = () => {

    return (
        <div className="mt-4">
            <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4">
                <ClinicStatsCards />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md overflow-auto">
                <ClinicViewAppointmentCalendar />
            </div>
        </div>
    )
}

export default DoctorsDashboardHome;