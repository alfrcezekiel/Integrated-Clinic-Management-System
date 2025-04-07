import { useMemo } from "react";
import PropTypes from "prop-types";
import {
    TableBody,
    TableRow,
    TableCell,
    Typography,
} from "@mui/material";

// This component is used to rende  r the table rows for the appointments table
const PendingStatusAppointmentTable = ({ retrievedAppointmentsData }) => {

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
                return "text-green-600 bg-green-100";
            case "Declined":
                return "text-red-600 bg-red-100";
            case "Pending":
                return "text-black bg-yellow-300";
            case "Consulted":
                return "text-black bg-blue-100";
            default:
                return "text-gray-600 bg-gray-100";
        }
    }


    // function to determine the color of the appointment date to match the status
    const getAppointmentDateColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-green-600 bg-green-100";
            case "Declined":
                return "text-red-600 bg-red-100";
            case "Pending":
                return "text-black bg-yellow-300";
            case "Consulted":
                return "text-black bg-blue-100";
            default:
                return "text-gray-600 bg-gray-100";
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
        const statusMatch = ["Approved", "Declined", "Pending", "Consulted"];

        if (retrievedAppointmentsData && retrievedAppointmentsData.length > 0) {
            return retrievedAppointmentsData.map((appointment, i) => (
                <TableRow key={i}>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.clinic_name}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
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
                        <Typography variant="body2" className={`rounded-lg p-2 ${getAppointmentDateColor(appointment.status)}`}>
                            {statusMatch.includes(appointment.appointmentDate) ? formatDate(appointment.appointmentDate) : formatDate(appointment.appointmentDate)}
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
                        <Typography variant="body2" className={`rounded-lg p-2 ${getStatusColor(appointment.status)}`}>
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

PendingStatusAppointmentTable.propTypes = {
    retrievedAppointmentsData: PropTypes.array,
};
export default PendingStatusAppointmentTable;