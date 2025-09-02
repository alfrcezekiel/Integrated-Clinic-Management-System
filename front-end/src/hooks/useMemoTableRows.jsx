import { useMemo } from "react";
import PropTypes from "prop-types";

// This component is used to render the table rows for the appointments table
const AppointmentsTable = ({ retrievedAppointmentsData }) => {
    // This function is used to format the date string to a more readable format
    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        });
    };

    // function to determine the color of patients status
    const getStatusStyles = (status) => {
        const baseClasses = "px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap";

        switch (status?.toLowerCase()) {
            case "approved":
                return `${baseClasses} bg-green-100 text-green-800`;
            case "declined":
                return `${baseClasses} bg-red-100 text-red-800`;
            case "consulted":
                return `${baseClasses} bg-blue-100 text-blue-800`;
            case "cancelled":
                return `${baseClasses} bg-yellow-100 text-yellow-800`;
            case "pending":
                return `${baseClasses} bg-gray-100 text-gray-800`;
            default:
                return `${baseClasses} bg-gray-100 text-gray-800`;
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
                    <td colSpan={8} className="py-3 px-5 text-center">
                        {retrievedAppointmentsData ? "No appointments found" : "Please input credentials to view appointments"}
                    </td>
                </tr>
            );
        }

        return retrievedAppointmentsData.map((appointment, i) => (
            <tr
                key={i}
                className="bg-white hover:bg-gray-50 transition-colors duration-150 text-center"
            >
                <td className="px-4 py-3 text-sm text-black whitespace-nowrap">
                    {appointment.firstName}
                    {" "}
                    {appointment.lastName}
                </td>
                <td className="px-4 py-3 text-sm text-black whitespace-nowrap text-center">
                    {appointment.email}
                </td>
                <td className="px-4 py-3 text-sm text-black whitespace-nowrap text-center">
                    {formatDate(appointment.appointmentDate)}
                </td>
                <td className="px-4 py-3 text-sm text-black whitespace-nowrap text-center">
                    {appointment.phoneNumber}
                </td>
                <td className="px-4 py-3 text-sm text-black whitespace-nowrap text-center">
                    {formatTimeToAMPM(appointment.preferredTime)}
                </td>
                <td className="px-4 py-3 text-sm whitespace-nowrap text-center text-black">
                    <span className={getStatusStyles(appointment.status)}>
                        {appointment.status}
                    </span>
                </td>
                <td className="px-4 py-3 text-sm text-black whitespace-nowrap text-center">
                    {appointment.purposeOfAppointment}
                </td>
            </tr>
        ));
    }, [retrievedAppointmentsData]);

    return (
        <tbody>
            {memoizedTableRows}
        </tbody>
    );
};

AppointmentsTable.propTypes = {
    retrievedAppointmentsData: PropTypes.array,
};

export default AppointmentsTable;