import {
    UserIcon,
    CalendarDaysIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    ChatBubbleLeftIcon,
} from "@heroicons/react/24/outline";
import CalculateBookedAppointments from "../../hooks/ClinicStatsHooks/useCalculateBookedAppointments";
import PatientsCount from "../../hooks/usePatientsCount";
import CalculatePendingBookedAppointments from "../../hooks/ClinicStatsHooks/useCalculatePendingBookedAppointments";
import TotalApprovedBookedAppointments  from "../../hooks/ClinicStatsHooks/useTotalApprovedBookedAppointments";
import CalculateDeclinedBookedAppointments from "../../hooks/ClinicStatsHooks/CalculateDeclinedBookeAppoinments";

// this data is used to display the clinic stats in the dashboard
const useClinicStatsData = () => {
    const totalAllBookedAppointments = CalculateBookedAppointments();
    const totalAllPatientsRegistered = PatientsCount();
    const totalPendingBookedAppointments = CalculatePendingBookedAppointments();
    const totalApprovedBookedAppointments = TotalApprovedBookedAppointments();
    const totalDeclinedBookedAppointments = CalculateDeclinedBookedAppointments();

    return [
        {
            label: "Registered Patients",
            value: totalAllPatientsRegistered,
            Icon: UserIcon,
            bgColor: "bg-blue-100",
        },
        {
            label: "All Appointments",
            value: totalAllBookedAppointments,
            Icon: CalendarDaysIcon,
            bgColor: "bg-green-100",
        },
        {
            label: "Pending Appointments",
            value: totalPendingBookedAppointments,
            Icon: ClockIcon,
            bgColor: "bg-yellow-100",
        },
        {
            label: "Approved Appointments",
            value: totalApprovedBookedAppointments,
            Icon: CheckCircleIcon,
            bgColor: "bg-emerald-100",
        },
        {
            label: "Declined Appointments",
            value: totalDeclinedBookedAppointments,
            Icon: XCircleIcon,
            bgColor: "bg-red-100",
        },
        {
            label: "Consulted Patients",
            value: 100,
            Icon: ChatBubbleLeftIcon,
            bgColor: "bg-purple-100",
        },
        {
            label: "Cancelled Appointments",
            value: 0,
            Icon: XCircleIcon,
            bgColor: "bg-orange-100",
        }
    ];
}

export default useClinicStatsData;