import {
    useCallback,
    useEffect,
    useState
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
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
} from "@mui/material"
import CMS from "../../API/CMS"
import HistoryIcon from '@mui/icons-material/History';
import CloseIcon from "@mui/icons-material/Close";

const AppointmentHistoryTable = () => {
    const appointmentsTableColumn = [
        "Clinic Name",
        'First Name',
        'Last Name',
        "Email",
        'Appointment Date',
        "Appointment Time",
        "Phone Number",
        "Gender",
        'Status',
        "View Patient Results"
    ]

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

    // function to format to MM/DD/YYYY to display in the table
    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    const location = useLocation();
    const [appointmentHistoryData, setAppointmentHistoryData] = useState([])

    const [open, setOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleOpenPatientResults = (patient) => {
        setSelectedPatient(patient);
        setOpen(true);
    }

    const handleClosePatientsResults = () => {
        setSelectedPatient(null);
        setOpen(false);
    }

    const handleOpen = useCallback((patient) => {
        handleOpenPatientResults(patient)
    }, [])

    const handleClose = useCallback(() => {
        handleClosePatientsResults()
    }, [])

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        const clinicID = localStorage.getItem("sid")

        const retrieveAppointmentHistory = async () => {
            try {
                const response = await CMS.get(`/CMS/clinic-dashboard/getAppointmentHistory/${clinicID}`);

                if (!response.data) {
                    throw new Error("No retrieved appointment history data");
                }

                if (response.status === 200) {
                    setAppointmentHistoryData(response.data.appointmentHistory);
                }
            } catch (error) {
                console.error(`Code functionality error for fetching approved status data: ${error}`);
            }
        }
        retrieveAppointmentHistory();
    }, [location.pathname])

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
                        title="Consulted Patients"
                        className="bg-blue-500 mb-2 p-6"
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
                                {appointmentHistoryData && appointmentHistoryData.length > 0 ? (
                                    appointmentHistoryData.map((appointment, id) => (
                                        <TableRow key={id} className={`hover:bg-gray-200 transition duration-200 ease-in-out ${getStatusColor(appointment.status)}`}>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.clinic_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.firstName}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.lastName}
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
                                                <Typography variant="body2" >
                                                    {appointment.status}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton
                                                    className="bg-blue-500 text-white hover:bg-blue-600"
                                                    onClick={() => handleOpen(appointment)}
                                                >
                                                    <HistoryIcon color="primary" />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={appointmentsTableColumn.length} align="center">
                                            <Typography variant="body2" className="text-blue-gray-900">
                                                No appointments available.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Modal for Patients Results */}
                <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md" className="rounded-4xl">
                    <DialogTitle className="flex justify-between items-center bg-blue-500">
                        <span className="text-lg font-semibold text-black">Patient Consultation</span>
                        <IconButton onClick={handleClose} className="text-white">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent className="bg-gray-50">
                        {selectedPatient && (
                            <div className="space-y-6 p-2">
                                {/* Patient Information */}
                                <section className="bg-white p-4 rounded-xl shadow-lg mt-3">
                                    <h3 className="text-lg font-semibold text-black mb-3">Patient Information</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>First Name: </strong>
                                            {selectedPatient.firstName}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Last Name: </strong>
                                            {selectedPatient.lastName}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Email: </strong>
                                            {selectedPatient.email}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Phone Number: </strong>
                                            {selectedPatient.phoneNumber}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Appointment Date: </strong>
                                            {dateFormat(selectedPatient.appointmentDate)}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Appointment Time: </strong>
                                            {formatTimeToAMPM(selectedPatient.preferredTime)}
                                        </div>
                                    </div>
                                </section>

                                {/* Medical History */}
                                <section className="bg-white p-4 rounded-xl shadow-lg">
                                    <h3 className="text-lg font-semibold text-black mb-3">Medical History</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Has Medical Condition: </strong>
                                            {selectedPatient.has_medical_condition || selectedPatient.medical_condition_details ?
                                                selectedPatient.has_medical_condition : selectedPatient.medical_condition_details
                                            }
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Medical Condition Details: </strong>
                                            {selectedPatient.has_medical_condition === "Yes" ? selectedPatient.medical_condition_details : "N/A"}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Has Taking Medication: </strong>
                                            {selectedPatient.taking_medication || selectedPatient.medication_details ? selectedPatient.taking_medication : selectedPatient.medication_details}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Taking Medication Details: </strong>
                                            {selectedPatient.taking_medication === "Yes" ? selectedPatient.medication_details : "N/A"}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Does Smoke: </strong>
                                            {selectedPatient.smokes || selectedPatient.smoke_frequency ? selectedPatient.smokes : selectedPatient.smoke_frequency}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Smoke Frequency Details: </strong>
                                            {selectedPatient.smokes === "Yes" ? selectedPatient.smoke_frequency : "N/A"}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Has Allergies: </strong>
                                            {selectedPatient.has_allergies || selectedPatient.allergies_details ? selectedPatient.has_allergies : selectedPatient.allergies_details}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Allergies Details: </strong>
                                            {selectedPatient.has_allergies === "Yes" ? selectedPatient.allergies_details : "N/A"}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Does Drinks Alcohol: </strong>
                                            {selectedPatient.drinks_alcohol || selectedPatient.alcohol_details ? selectedPatient.drinks_alcohol : selectedPatient.alcohol_details}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Drinks Frequency Details: </strong>
                                            {selectedPatient.drinks_alcohol === "Yes" ? selectedPatient.alcohol_details : "N/A"}
                                        </div>
                                    </div>
                                </section>

                                {/* Lifestyle Info */}
                                <section className="bg-white p-4 rounded-xl shadow-lg">
                                    <h3 className="text-lg font-semibold text-black mb-3">Lifestyle Information</h3>
                                    <div className="space-y-2 text-sm text-gray-700">
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Diagnosis: </strong>
                                            {selectedPatient.diagnosis}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Symptoms: </strong>
                                            {selectedPatient.symptoms}
                                        </div>
                                        <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                            <strong>Prescription: </strong>
                                            {selectedPatient.prescription}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}

export default AppointmentHistoryTable;