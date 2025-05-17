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
import DeleteIcon from "@mui/icons-material/Delete";

// function component of registerd patients accounts
const PatientsAccountsTableValue = ({ patientsAccountData, registerPatientColumns, updateRegisteredPatientsAccount, deleteRegisteredPatientsAccount }) => {
    // function to determine  the color of registered patient account status
    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-black bg-green-200";
            case "Declined":
                return "text-black bg-red-200";
            case "Pending":
                return "text-black bg-white";
            default:
                return "text-black bg-white";
        }
    }

    // function to format to MM/DD/YYYY to display in the table
    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    const memoizedTableRows = useMemo(() => {
        if (patientsAccountData && patientsAccountData.length > 0) {
            return patientsAccountData.map((patient, i) => (
                <TableRow key={i} className={`hover:bg-gray-200 transition duration-200 ease-in-out ${getStatusColor(patient.status)}`}>
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
                            {patient.address}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.gender}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.civilStatus}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {dateFormat(patient.dateOfBirth)}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.phoneNumber}
                        </Typography>
                    </TableCell>
                    <TableCell className="border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patient.status}
                        </Typography>
                    </TableCell>
                    <TableCell align="center">
                        <IconButton aria-label="edit" onClick={() => updateRegisteredPatientsAccount(patient)}>
                            <EditIcon color="primary" />
                        </IconButton>
                    </TableCell>
                    <TableCell align="center">
                        <IconButton aria-label="edit" onClick={() => deleteRegisteredPatientsAccount(patient)}>
                            <DeleteIcon color="error"/>
                        </IconButton>
                    </TableCell>
                </TableRow>
            ));
        } else {
            // If no data is found, render a no appointments found row
            return (
                <TableRow key={0}>
                    <TableCell colSpan={registerPatientColumns?.length ?? 10} className="py-3 px-5 border-b border-blue-gray-50 text-center" align="center">
                        <Typography variant="body2" className="text-blue-gray-900">
                            {patientsAccountData ? "No appointments found" : "Please input credentials to view approved appointments"}
                        </Typography>
                    </TableCell>
                </TableRow>
            );
        }
    }, [patientsAccountData, registerPatientColumns, updateRegisteredPatientsAccount, deleteRegisteredPatientsAccount]);

    return (
        <TableBody>
            {memoizedTableRows}
        </TableBody>
    )
}

PatientsAccountsTableValue.propTypes = {
    patientsAccountData: PropTypes.array.isRequired,
    registerPatientColumns: PropTypes.array.isRequired,
    updateRegisteredPatientsAccount: PropTypes.func.isRequired,
    deleteRegisteredPatientsAccount: PropTypes.func.isRequired
}

export default PatientsAccountsTableValue