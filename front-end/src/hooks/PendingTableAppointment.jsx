import { useMemo } from "react";
import PropTypes from "prop-types";

// This component is used to render the table rows for the appointments table
const PendingStatusAppointmentTable = ({ retrievedAppointmentsData, appointmentTableColumn }) => {

    // This function is used to format the date string to a more readable format
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";

        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    // function to determine  the color of patients status
    const getStatusColor = (status) => {
        const baseStyles = "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
        switch (status?.toLowerCase()) {
            case "approved":
                return `${baseStyles} text-black bg-green-200 dark:bg-green-800`;
            case "declined":
                return `${baseStyles} text-black bg-red-200 dark:bg-red-800`;
            case "consulted":
                return `${baseStyles} text-black bg-blue-200 dark:bg-blue-800`;
            case "pending":
                return `${baseStyles} text-gray-800 bg-white dark:bg-gray-200`;
            default:
                return `${baseStyles} text-black bg-white dark:bg-gray-200`;
        }
    }

    const formatTimeToAMPM = (time) => {
        if (!time) return "N/A";
        if (time.includes("AM") || time.includes("PM")) return time;

        try {
            const [hours, minutes] = time.split(":");
            let hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? "PM" : "AM";
            hour = hour % 12 || 12;
            return `${hour}:${minutes || "00"} ${ampm}`;
        } catch {
            return time;
        }
    };

    const memoizedTableRows = useMemo(() => {
        if (!retrievedAppointmentsData || retrievedAppointmentsData.length === 0) {
            return (
                <tr>
                    <td
                        colSpan={appointmentTableColumn?.length || 9}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                        No pending appointments found
                    </td>
                </tr>
            )
        }

        return retrievedAppointmentsData.map((appointment, i) => (
            <tr
                key={i}
                className={`${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-50 text-center transition-colors duration-150`}
            >
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {appointment.clinic_name}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {appointment.firstName}
                    {" "}
                    {appointment.lastName}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {appointment.email}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {formatDate(appointment.appointmentDate)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {appointment.phoneNumber}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {formatTimeToAMPM(appointment.preferredTime)}
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    <span className={`${getStatusColor(appointment.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                        {appointment.status}
                    </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {appointment.purposeOfAppointment}
                </td>
            </tr>
        ));
    }, [retrievedAppointmentsData, appointmentTableColumn]);

    return (
        <tbody>
            {memoizedTableRows}
        </tbody>
    );
};

PendingStatusAppointmentTable.propTypes = {
    retrievedAppointmentsData: PropTypes.array,
    appointmentTableColumn: PropTypes.array,
};
export default PendingStatusAppointmentTable;