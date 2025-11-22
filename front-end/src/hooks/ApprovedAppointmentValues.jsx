import { useMemo } from "react";
import PropTypes from "prop-types";

const ApprovedAppointmentsTableValue = ({ retrievedAppointmentsData, appointmentsTableColumn }) => {
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

    // Function to determine the color of patient status
    const getStatusStyles = (status) => {
        if (!status) return "px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800";

        const statusLower = status.toLowerCase();
        const baseStyles = "px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap";

        switch (statusLower) {
            case 'approved':
                return `${baseStyles} bg-green-100 text-green-800`;
            case 'declined':
                return `${baseStyles} bg-red-100 text-red-800`;
            case 'consulted':
                return `${baseStyles} bg-blue-100 text-blue-800`;
            case 'pending':
                return `${baseStyles} bg-yellow-100 text-yellow-800`;
            default:
                return `${baseStyles} bg-gray-100 text-gray-800`;
        }
    };

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
                        colSpan={appointmentsTableColumn?.length || 8}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center"
                    >
                        No appointments found
                    </td>
                </tr>
            );
        }

        return retrievedAppointmentsData.map((appointment, index) => (
            <tr
                key={index}
                className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 text-center transition-colors`}
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
                    {appointment.address}
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
                    <span className={`${getStatusStyles(appointment.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                        {appointment.status}
                    </span>
                </td>
                <td className="px-6 py-3 whitespace-nowrap text-sm text-black dark:text-black">
                    {appointment.purposeOfAppointment}
                </td>
            </tr>
        ));
    }, [retrievedAppointmentsData, appointmentsTableColumn]);

    return (
        <tbody>
            {memoizedTableRows}
        </tbody>
    );
};

ApprovedAppointmentsTableValue.propTypes = {
    retrievedAppointmentsData: PropTypes.array,
    appointmentsTableColumn: PropTypes.array
};

export default ApprovedAppointmentsTableValue;