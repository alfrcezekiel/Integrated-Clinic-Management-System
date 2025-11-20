import ClinicViewAppointmentCalendar from "../../../layouts/ClinicUtils/ViewClinicCalendar/ClinicViewAppointmentCalendar";
import ClinicStatsCards from "../../cards/clinic stats/ClinicStats";
import PopularAppointmentCard from "../../../layouts/ClinicUtils/popularity_appointment_card/popularity_appointment_date";

const DoctorsDashboardHome = () => {
    return (
        <div className="mt-4">
            <div className="mb-8">
                <ClinicStatsCards />
            </div>
            <div className="mb-8"> 
                <PopularAppointmentCard />
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <ClinicViewAppointmentCalendar />
            </div>
        </div>
    )
}

export default DoctorsDashboardHome;