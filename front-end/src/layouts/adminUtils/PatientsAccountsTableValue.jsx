import {
    useMemo
} from "react"
import PropTypes from "prop-types";
import {
    TableBody,
    TableRow,
    TableCell,
    Typography,
    IconButton
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";

const PatientsAccountsTableValue = ({ patientsAccountData, registerPatientColumns }) => {
    // function to determine  the color of registered patient account status
    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-black bg-green-300";
            case "Declined":
                return "text-black bg-red-300";
            case "Pending":
                return "text-black bg-yellow-300";
            default:
                return "text-gray-600 bg-gray-100";
        }
    }
    
    const memoizedTableRows = useMemo(() => {
        if (patientsAccountData && patientsAccountData.length > 0) {
            return patientsAccountData.map((patient, i) => (
                <TableRow key={i}>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.firstName}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.lastName}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.email}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.phoneNumber}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className={`rounded-lg p-2 ${getStatusColor(patient.status)}`}>
                            {patient.status}
                        </Typography>
                    </TableCell>
                    <TableCell align="center">
                        <IconButton aria-label="edit">
                            <EditIcon />
                        </IconButton>
                    </TableCell>
                </TableRow>
            ));
        } else {
            // If no data is found, render a no appointments found row
            return (
                <TableRow key={0}>
                    <TableCell colSpan={registerPatientColumns?.length ?? 6} className="py-3 px-5 border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patientsAccountData ? "No appointments found" : "Please input credentials to view approved appointments"}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }
    }, [patientsAccountData, registerPatientColumns]);

    return (
        <TableBody>
            {memoizedTableRows}
        </TableBody>
    )
}

PatientsAccountsTableValue.propTypes = {
    patientsAccountData: PropTypes.array.isRequired,
    registerPatientColumns: PropTypes.array.isRequired,
}

export default PatientsAccountsTableValue