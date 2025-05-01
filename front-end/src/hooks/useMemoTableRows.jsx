import { useMemo } from "react";
import PropTypes from "prop-types";
import {
    TableBody,
    TableRow,
    TableCell,
    Typography,
} from "@mui/material";

// This component is used to rende  r the table rows for the appointments table
const AppointmentsTable = ({ retrievedAppointmentsData }) => {

    // This function is used to format the date string to a more readable format
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    // function to determine  the color of patients status
    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-black bg-green-200";
            case "Declined":
                return "text-black bg-red-200";
            case "Consulted":
                return "text-black bg-blue-200";
            case "Pending":
                return "text-black bg-white"
            default:
                return "text-black bg-white";
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
        if (retrievedAppointmentsData && retrievedAppointmentsData.length > 0) {
            return retrievedAppointmentsData.map((appointment, i) => (
                <TableRow key={i} className={`hover:bg-gray-200 transition duration-200 ease-in-out ${getStatusColor(appointment.status)}`}>
                    <TableCell className={`border-b border-blue-gray-50 text-center`} align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.firstName}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.lastName}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.email}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {formatDate(appointment.appointmentDate)}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.phoneNumber}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {formatTimeToAMPM(appointment.preferredTime) ? formatTimeToAMPM(appointment.preferredTime) : "N/A"}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.status}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.purposeOfAppointment}
                        </Typography>
                    </TableCell>
                </TableRow>
            ));
        } else {
            // If no data is found, render a no appointments found row
            return (
                <TableRow key={0}>
                    <TableCell colSpan={9} className="py-3 px-5 border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {retrievedAppointmentsData ? "No appointments found" : "Please input credentials to view appointments"}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }
    }, [retrievedAppointmentsData]);

    return (
        <TableBody>
            {memoizedTableRows}
        </TableBody>
    );
};

AppointmentsTable.propTypes = {
    retrievedAppointmentsData: PropTypes.array,
};
export default AppointmentsTable;