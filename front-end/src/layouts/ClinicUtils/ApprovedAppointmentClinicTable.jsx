import { useEffect } from "react"
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
import ConsultationFormModal from "./ConsultationFormModal"

const ApprovedAppointmentClinicTable = () => {
    const [appointmentsData, setAppointmentsData] = useState([])

    const [consultationFormData, setConsultationFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        appoimtmentdate: "",
        appointmentTime: "",
        hasMedicalConditions: "No",
        medicalConditionDetails: "",
        takingMedications: "No",
        medicationDetails: "",
        smokes: "No",
        smokeFrequency: "",
        hasAllergies: "No",
        allergyDetails: "",
        drinksAlcohol: "No",
        alcoholFrequency: "",
        diagnosis: "",
        symptoms: "",
        prescription: "",
        consent: "Yes",
        appointment_id: "",
    })

    const [fieldsError, setFieldsError] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        appointmentDate: "",
        appointmentTime: "",
        hasMedicalConditions: "No",
        medicalConditionDetails: "",
        takingMedications: "No",
        medicationDetails: "",
        smokes: "No",
        smokeFrequency: "",
        hasAllergies: "No",
        allergyDetails: "",
        drinksAlcohol: "No",
        alcoholFrequency: "",
        diagnosis: "",
        symptoms: "",
        prescription: "",
        consent: "Yes",
    })

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
        'Purpose of Appointment',
        "Consult Patient"
    ]

    const [open, setOpen] = useState(false);

    // this function is to formate the date to YYYY-MM-DD
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleOpenConsulationForm = (appointment) => {
        setConsultationFormData({
            firstName: appointment.firstName,
            lastName: appointment.lastName,
            email: appointment.email,
            phoneNumber: appointment.phoneNumber,
            appointmentDate: formatDate(appointment.appointmentDate),
            appointmentTime: appointment.preferredTime,
            appointment_id: appointment.appointmentID,
            clinic_name: appointment.clinic_name,
        })
        setOpen(true)
    }

    const handleClose = () => {
        setOpen(false);
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

    // const navigate = useNavigate();
    const location = useLocation();
    
    const retrieveAppoinmentApprovedStatus = async () => {
        const clinicID = localStorage.getItem("sid")
        try {
            const response = await CMS.get(`/CMS/doctors-dashboard/getPatientApprovedStatus/${clinicID}`);

            if (!response.data) {
                throw new Error("No retrieved approved status for appointments");
            }

            if (response.status === 200) {
                setAppointmentsData(response.data.patientsApprovedStatus);
            }
        } catch (error) {
            console.error(`Code functionality error for fetching approved status data: ${error}`);
        }
    }

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS"
        }
        titleHeader();

        retrieveAppoinmentApprovedStatus();
    }, [location.pathname])


    // function to format to MM/DD/YYYY to display in the table
    const dateFormat = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric"
        })
    };

    const navigate = useNavigate();

    // this function is to submit the consultation form data
    const handleSubmit = async () => {
        try {
            const response = await CMS.post("/CMS/clinic-dashboard/consultPatient", {
                ...consultationFormData,
                admin_id: localStorage.getItem("sid"),
                clinic_name: consultationFormData.clinic_name,
                appointment_id: consultationFormData.appointment_id
            }, {
                headers: {
                    "Content-Type": "application/json",
                },
            })

            if (response.status === 200) {
                alert("Consulted Patient Successfully!");
                navigate("/doctor-portal/dashboard/appointment-history")
                setOpen(false);
                retrieveAppoinmentApprovedStatus();
            }
        } catch (error) {
            console.error(`Code functionality error in consultation form: ${error}`);
        }
    }

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
                                                <Typography variant="body2" className="text-blue-gray-900">
                                                    {appointment.purposeOfAppointment}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Button
                                                    variant="contained"
                                                    onClick={() => handleOpenConsulationForm(appointment)}
                                                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
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
                                                No appointments available.
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
            <ConsultationFormModal
                open={open}
                onClose={handleClose}
                onSubmit={handleSubmit}
                consultationFormData={consultationFormData}
                setConsultationFormData={setConsultationFormData}
                fieldsError={fieldsError}
                setFieldsError={setFieldsError}
            />
        </>
    )
}

export default ApprovedAppointmentClinicTable;