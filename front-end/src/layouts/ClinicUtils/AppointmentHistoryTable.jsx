import { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
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
} from "@mui/material";
import CMS from "../../API/CMS";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";

const AppointmentHistoryTable = () => {
    const appointmentsTableColumn = [
        "Clinic Name",
        "First Name",
        "Last Name",
        "Email",
        "Appointment Date",
        "Appointment Time",
        "Phone Number",
        "Gender",
        "Status",
        "View Patient Results",
    ];

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
            day: "numeric",
        });
    };

    const location = useLocation();
    const [appointmentHistoryData, setAppointmentHistoryData] = useState([]);

    const [open, setOpen] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);

    const handleOpenPatientResults = (patient) => {
        setSelectedPatient(patient);
        setOpen(true);
    };

    const handleClosePatientsResults = () => {
        setSelectedPatient(null);
        setOpen(false);
    };

    const handleOpen = useCallback((patient) => {
        handleOpenPatientResults(patient);
    }, []);

    const handleClose = useCallback(() => {
        handleClosePatientsResults();
    }, []);

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Clinic's Dashboard | Patient's Appointment | CMS";
        };
        titleHeader();

        const clinicID = localStorage.getItem("sid");

        const retrieveAppointmentHistory = async () => {
            try {
                const response = await CMS.get(
                    `/CMS/clinic-dashboard/getAppointmentHistory/${clinicID}`,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
                        },
                    }
                );

                if (!response.data) {
                    throw new Error("No retrieved appointment history data");
                }

                if (response.status === 200) {
                    setAppointmentHistoryData(response.data.appointmentHistory);
                }
            } catch (error) {
                console.error(
                    `Code functionality error for fetching approved status data: ${error}`
                );
            }
        };
        retrieveAppointmentHistory();
    }, [location.pathname]);

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
    };

    return (
        <>
            <div className="mt-12 mb-1 flex justify-center items-center w-full">
                <Card className="shadow-lg rounded-2xl w-full">
                    <CardHeader
                        title="Consulted Patients"
                        className="bg-blue-500 mb-2 p-6"
                        slotProps={{
                            title: {
                                variant: "h6",
                                className: "text-white text-center",
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
                                        <TableRow
                                            key={id}
                                            className={`hover:bg-gray-200 transition duration-200 ease-in-out ${getStatusColor(
                                                appointment.status
                                            )}`}
                                        >
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {appointment.clinic_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {appointment.patient_first_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {appointment.patient_last_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {appointment.patient_email}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {dateFormat(appointment.appointment_date)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {formatTimeToAMPM(appointment.appointment_time)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {appointment.phoneNumber}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-blue-gray-900"
                                                >
                                                    {appointment.gender}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography variant="body2">
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
                                        <TableCell
                                            colSpan={appointmentsTableColumn.length}
                                            align="center"
                                        >
                                            <Typography
                                                variant="body2"
                                                className="text-blue-gray-900"
                                            >
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
                <Dialog
                    open={open}
                    onClose={handleClose}
                    fullWidth
                    maxWidth="md"
                    className="rounded-2xl"
                >
                    <DialogTitle className="flex justify-between items-center bg-blue-500">
                        <span className="text-lg font-semibold text-white">
                            Patient Consultation Result
                        </span>
                        <IconButton onClick={handleClose} className="text-white">
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent className="bg-gray-100">
                        {selectedPatient && (
                            <>
                                <div className="space-y-6 p-4">
                                    {/* Patient Information */}
                                    <section className="bg-white p-4 rounded-xl shadow-lg">
                                        <h3 className="text-lg font-semibold text-black mb-3">
                                            Patient Information
                                        </h3>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-700">
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>First Name: </strong>
                                                {selectedPatient.patient_first_name}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Last Name: </strong>
                                                {selectedPatient.patient_last_name}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Email: </strong>
                                                {selectedPatient.patient_email}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Phone Number: </strong>
                                                {selectedPatient.phoneNumber}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Appointment Date: </strong>
                                                {dateFormat(selectedPatient.appointment_date)}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Appointment Time: </strong>
                                                {formatTimeToAMPM(selectedPatient.appointment_time)}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Status: </strong>
                                                {selectedPatient.status}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Gender: </strong>
                                                {selectedPatient.gender}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Purpose Of Appointment: </strong>
                                                {selectedPatient.purposeOfAppointment}
                                            </div>
                                        </div>
                                    </section>

                                    {/* /* Medical History */}
                                    <section className="bg-white p-4 rounded-xl shadow-lg">
                                        <h3 className="text-lg font-semibold text-black mb-3">
                                            Medical History
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Reason For Visit: </strong>
                                                {selectedPatient.what_brings_you_here_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Symptoms Started: </strong>
                                                {selectedPatient.symptoms_start_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Reported Symptoms: </strong>
                                                {selectedPatient.symptoms__details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Known Medical Conditions: </strong>
                                                {selectedPatient.medical_condition_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Current Medications: </strong>
                                                {selectedPatient.medication_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Smoking Habits: </strong>
                                                {selectedPatient.smoke_frequency || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Known Allergies: </strong>
                                                {selectedPatient.allergies_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Prior Encountered Concern: </strong>
                                                {selectedPatient.experience_issue_dettails || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Alcohol Consumption: </strong>
                                                {selectedPatient.alcohol_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>History of Surgical Procedures: </strong>
                                                {selectedPatient.past_surgeries_details || "N/A"}
                                            </div>
                                        </div>
                                    </section>
                                    <section className="bg-white p-4 rounded-xl shadow-lg">
                                        <h3 className="text-lg font-semibold text-black mb-4">
                                            Lifestyle and Clinical Assessment
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                            <div>
                                                <strong>Clinical Diagnosis: </strong>
                                                {selectedPatient.diagnosis || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Reported Symptoms: </strong>
                                                {selectedPatient.symptoms || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Prescribed Medications: </strong>
                                                {selectedPatient.prescription || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Treatment Plan Summary: </strong>
                                                {selectedPatient.treatment_plan || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Exercise Routine: </strong>
                                                {selectedPatient.exercise_frequency_details || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Immunization Record: </strong>
                                                {selectedPatient.vaccination_details || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Average Sleep Duration: </strong>
                                                {selectedPatient.sleep_hours_details || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Heart Rate: </strong>
                                                {selectedPatient.heart_rate_details || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Blood Pressure Reading: </strong>
                                                {selectedPatient.blood_pressure_details || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Stress Level: </strong>
                                                {selectedPatient.stress_level_details || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Hydration Status: </strong>
                                                {selectedPatient.water_intake_details || "N/A"}
                                            </div>
                                            <div>
                                                <strong>Supplement Intake: </strong>
                                                {selectedPatient.taking_supplements_details || "N/A"}
                                            </div>
                                        </div>
                                    </section>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </>
    );
};

export default AppointmentHistoryTable;
