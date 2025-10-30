import {
    useEffect,
    useCallback
} from "react"
import {
    useLocation,
    useNavigate
} from "react-router-dom"
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
    Button,
} from "@mui/material"
import { useState } from "react"
import CMS from "../../API/CMS"
import { useAuthorization } from "../../context/auth/useAuthorization"

const ApprovedAppointmentClinicTable = () => {
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
        "Consult Patient"
    ]
    const { token, user } = useAuthorization();

    // this function is to formate the date to YYYY-MM-DD
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };


    const handleOpenConsulationForm = (appointment) => {
        navigate("/doctor-portal/dashboard/ConsultPatient", {
            state: {
                appointmentData: {
                    firstName: appointment.firstName,
                    lastName: appointment.lastName,
                    email: appointment.email,
                    phoneNumber: appointment.phoneNumber,
                    appointmentDate: formatDate(appointment.appointmentDate),
                    preferredTime: appointment.preferredTime,
                    appointmentID: appointment.appointmentID,
                    clinic_name: appointment.clinic_name,
                    type: "Patient"
                }
            }
        })
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

    const navigate = useNavigate();
    const location = useLocation();

    const clinicID = user?.sid || localStorage.getItem("sid");
    if (!clinicID) {
        console.error("No clinic ID found in user session or localStorage");
    }

    const tokenContext = token || localStorage.getItem("authToken");
    if (!tokenContext) {
        console.error("No token found in context or localStorage");
    }

    const retrieveAppoinmentApprovedStatus = useCallback(async () => {
        try {
            const response = await CMS.get(`/doctors-dashboard/getPatientApprovedStatus/${clinicID}`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                }
            });

            if (!response.data) {
                throw new Error("No retrieved approved status for appointments");
            }

            if (response.status === 200) {
                setAppointmentsData(response.data.patientsApprovedStatus);
            } else {
                throw new Error(`Failed to retrieve approved status data: ${response.status}`);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching approved status data: ${error}`);
        }
    }, [clinicID, tokenContext]);

    useEffect(() => {

        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        retrieveAppoinmentApprovedStatus();
    }, [location.pathname, clinicID, tokenContext, retrieveAppoinmentApprovedStatus]);

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
                return "text-black bg-white";
            case "Consulted":
                return "text-black bg-blue-200";
            default:
                return "text-black bg-white";
        }
    }

    return (
        <>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg rounded-2xl w-full">
                    <CardHeader
                        title="Approved Appointments"
                        className="bg-blue-600 mb-2 p-6"
                        slotProps={{
                            title: {
                                variant: 'h6',
                                className: 'text-white text-center',
                            },
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
                                                <Typography variant="body2" className="text-black">
                                                    {appointment.clinic_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-black">
                                                    {appointment.firstName} {appointment.lastName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-black">
                                                    {appointment.email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blac">
                                                    {dateFormat(appointment.appointmentDate)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-black">
                                                    {formatTimeToAMPM(appointment.preferredTime)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-black">
                                                    {appointment.phoneNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-black">
                                                    {appointment.gender}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-black">
                                                    {appointment.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-black">
                                                    {appointment.purposeOfAppointment}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleOpenConsulationForm(appointment)}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded cursor-pointer">
                                                    <Typography
                                                        variant="body2"
                                                        className="text-white font-bold"
                                                    >
                                                        Consult Patient
                                                    </Typography>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={appointmentsTableColumn.length} align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                No approved appointments available.
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

export default ApprovedAppointmentClinicTable;