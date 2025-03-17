import { useMemo } from "react";
import PropTypes from "prop-types";
import { 
    TableBody, 
    TableRow, 
    TableCell, 
    Typography,
} from "@mui/material";

// This function is used to format the date string to a more readable format
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
};

// function to determine  the color of patients status
const getStatusColor = (status) => {
    switch(status){
        case "Scheduled":
            return "text-green-600 bg-green-100";
        case "Cancelled":
            return "text-red-600 bg-red-100";
        case "Pending": 
            return "text-yellow-600 bg-yellow-100";
        default:
            return "text-gray-600 bg-gray-100";
    }
}
// This component is used to rende  r the table rows for the appointments table
const AppointmentsTable = ({ retrievedAppointmentsData, isAppointmentOpen }) => {
    const memoizedTableRows = useMemo(() => {
        if (!isAppointmentOpen && retrievedAppointmentsData.length >= 0 ) {
            return retrievedAppointmentsData.map((appointment, i) => (
                <TableRow key={i}>
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
                            {appointment.gender}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.doctor}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className={`text-blue-gray-900 ${getStatusColor(appointment.status)}`}>
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
                <TableRow>
                    <TableCell colSpan={7} className="py-3 px-5 border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {retrievedAppointmentsData ? "No appointments found" : "Please input credentials to view appointments"}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }
    }, [isAppointmentOpen, retrievedAppointmentsData]); 

    return (
        <TableBody>
            {memoizedTableRows}
        </TableBody>
    );
};

AppointmentsTable.propTypes = {
    retrievedAppointmentsData: PropTypes.array,
    isAppointmentOpen: PropTypes.bool,
};
export default AppointmentsTable;