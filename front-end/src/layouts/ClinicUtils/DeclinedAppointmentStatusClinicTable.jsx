import {
    useEffect,
    useCallback
} from "react"
import { useLocation } from "react-router-dom"
import {
    Card,
    CardContent,
    CardHeader,
    Table,
    TableHead,
    TableRow,
    TableCell,
    Typography,
    TableBody,
} from "@mui/material"
import { useState } from "react"
import CMS from "../../API/CMS"
import { useAuthorization } from "../../context/auth/useAuthorization"

const DeclinedAppointmentStatusClinicTable = () => {
    const [appointmentsData, setAppointmentsData] = useState([])
    const appointmentsTableColumn = [
        "Clinic Name",
        'Full Name',
        "Email",
        'Appointment Date',
        "Appointment Time",
        "Phone Number",
        "Gender",
        'Status',
        'Purpose of Appointment',
    ]
    const { user, token } = useAuthorization();

    const location = useLocation();
    const clinicID = user?.sid
    const tokenContext = token;

    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }
    if (!clinicID) {
        console.error("No clinic ID found in context or localStorage");
    }

    const retrieveAppoinmentDeclinedStatus = useCallback(async () => {
        try {
            const response = await CMS.get(`/doctors-dashboard/getPatientDeclinedStatus/${clinicID}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}}`,
                }
            });

            if (!response.data) {
                throw new Error("No retrieved declined status for appointments");
            }

            if (response.status === 200) {
                setAppointmentsData(response.data.patientsDeclinedStatus);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching declined status data: ${error}`);
        }
    }, [tokenContext, clinicID]);

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        retrieveAppoinmentDeclinedStatus();
    }, [location.pathname, clinicID, tokenContext, retrieveAppoinmentDeclinedStatus]);

    // function to format to MM/DD/YYYY to display in the table
    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    // this function determines the color of the status of the patients
    const getStatusColor = (status) => {
        switch (status) {
            case "Approved":
                return "text-black bg-green-200";
            case "Declined":
                return "text-black bg-red-200";
            case "Pending":
                return "text-black bg-yellow-200";
            case "Consulted":
                return "text-black bg-blue-200";
            default:
                return "text-gray-600 bg-gray-200";
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

    return (
        <>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg rounded-2xl w-full">
                    <CardHeader
                        title="Declined Appointments"
                        className="bg-blue-500 mb-2 p-6"
                        slotProps={{
                            title: {
                                variant: 'h6',
                                className: 'text-white text-center',
                            }
                        }}
                    />
                    <CardContent className="overflow-x-scroll pt-0 pb-2 rounded-xl shadow-sm bg-white">
                        <Table className="w-full min-w-[640px] table-auto">
                            <TableHead className="bg-gray-100 text-sm sm:text-base text-gray-600 uppercase">
                                <TableRow>
                                    {appointmentsTableColumn.map((header, i) => (
                                        <TableCell
                                            key={i}
                                            className="border-b border-blue-gray-50 text-center py-3 px-5"
                                            align="center"
                                        >
                                            <Typography
                                                variant="body2"
                                                className="text-[11px] font-bold uppercase text-blue-gray-400"
                                            >
                                                {header}
                                            </Typography>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointmentsData && appointmentsData.length > 0 ? (
                                    appointmentsData.map((appointment, id) => (
                                        <TableRow key={id} className={`hover:bg-gray-200 transition duration-200 ease-in-out ${getStatusColor(appointment.status)}`}>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.clinic_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.firstName} {appointment.lastName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {dateFormat(appointment.appointmentDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {formatTimeToAMPM(appointment.preferredTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.phoneNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.gender}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.purposeOfAppointment}
                                                </Typography>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={appointmentsTableColumn.length} align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                No declined appointments available.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    )
}

export default DeclinedAppointmentStatusClinicTable;