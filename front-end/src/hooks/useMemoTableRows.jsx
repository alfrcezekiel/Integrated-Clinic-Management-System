import { useMemo } from "react";
import PropTypes from "prop-types";
import { 
    TableBody, 
    TableRow, 
    TableCell, 
    Typography,
    IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    return `${month}/${day}/${year}`;
};

// This component is used to render the table rows for the appointments table
const AppointmentsTable = ({ retrievedAppointmentsData, isAppointmentOpen, onUpdateAppointment }) => {
    const memoizedTableRows = useMemo(() => {
        if (!isAppointmentOpen && retrievedAppointmentsData.length >= 0 ) {
            return retrievedAppointmentsData.map((appointment, i) => (
                <TableRow key={i}>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.appointmentID}
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
                            {formatDate(appointment.appointmentDate)}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {appointment.doctor}
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
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <IconButton
                            onClick={() => onUpdateAppointment(appointment)}
                            color="primary"
                            aria-label="update appointment"
                        >
                            <EditIcon />
                        </IconButton>
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
    }, [isAppointmentOpen, retrievedAppointmentsData, onUpdateAppointment]); 

    return (
        <TableBody>
            {memoizedTableRows}
        </TableBody>
    );
};

AppointmentsTable.propTypes = {
    retrievedAppointmentsData: PropTypes.array,
    isAppointmentOpen: PropTypes.bool,
    onUpdateAppointment: PropTypes.func.isRequired
};
export default AppointmentsTable;