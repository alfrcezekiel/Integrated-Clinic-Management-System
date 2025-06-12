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
import { useAuthorization } from "../../context/auth/useAuthorization";

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
    const { user, token } = useAuthorization();

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

        const clinicID = user?.sid;
        const tokenContext = token;
        if (!tokenContext && !clinicID) {
            console.error("No token and clinic id found in context or localStorage");
            setAppointmentHistoryData([]);
            return;
        }

        const retrieveAppointmentHistory = async () => {
            try {
                const response = await CMS.get(`/CMS/clinic-dashboard/getAppointmentHistory/${clinicID}`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${tokenContext}`,
                    },
                });

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
    }, [location.pathname, user?.sid, token]);

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
                                                <strong className="text-sm/6">First Name: </strong>
                                                {selectedPatient.patient_first_name}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Last Name: </strong>
                                                {selectedPatient.patient_last_name}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Email: </strong>
                                                {selectedPatient.patient_email}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Phone Number: </strong>
                                                {selectedPatient.phoneNumber}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Appointment Date: </strong>
                                                {dateFormat(selectedPatient.appointment_date)}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Appointment Time: </strong>
                                                {formatTimeToAMPM(selectedPatient.appointment_time)}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Status: </strong>
                                                {selectedPatient.status}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Gender: </strong>
                                                {selectedPatient.gender}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Purpose Of Appointment: </strong>
                                                {selectedPatient.purposeOfAppointment}
                                            </div>
                                        </div>
                                    </section>

                                    {/* /* Medical History */}
                                    <section className="bg-white p-4 rounded-xl shadow-lg">
                                        <h3 className="text-lg font-semibold text-black mb-3">
                                            Medical History Overview
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700">
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Documented Allergic Reactions: </strong>
                                                {selectedPatient.allergy_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Current Prescription Medications: </strong>
                                                {selectedPatient.taking_prescription_medication_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong>Chronic Health Conditions: </strong>
                                                {selectedPatient.chronic_condition_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Temporomandibular Joint (TMJ) or Jaw Pain History: </strong>
                                                {selectedPatient.history_of_jaw_pain_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">History of Excessive Bleeding: </strong>
                                                {selectedPatient.experienced_excessive_bleeding_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Cardiovascular History: </strong>
                                                {selectedPatient.past_history_of_cardiovascular_issues || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Prophylactic Antibiotic Recommendation: </strong>
                                                {selectedPatient.advised_taking_antibiotics_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Surgical History: </strong>
                                                {selectedPatient.past_surgeries_details || "N/A"}
                                            </div>
                                        </div>
                                    </section>
                                    <section className="bg-white p-4 rounded-xl shadow-lg">
                                        <h3 className="text-lg font-semibold text-black mb-4">
                                            Lifestyle and Clinical Assessment Overview
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Gingival Bleeding History: </strong>
                                                {selectedPatient.experience_bleeding_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Dental Sensitivity Description: </strong>
                                                {selectedPatient.tooth_sensitivity_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Concerns Regarding Dental Aesthetics: </strong>
                                                {selectedPatient.dental_appearance_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Tooth Mobility Observations: </strong>
                                                {selectedPatient.loose_teeth_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Regular Physical Activity: </strong>
                                                {selectedPatient.regular_exercise_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Alcohol Consumption Habits: </strong>
                                                {selectedPatient.consume_alcohol_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Dental Floss Usage: </strong>
                                                {selectedPatient.dental_floss_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Intake of Sugary Foods or Beverages: </strong>
                                                {selectedPatient.consume_sugary_foods_or_beverages_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Oral Malodor or Dysgeusia: </strong>
                                                {selectedPatient.bad_breath_or_bad_taste_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Recent Dental Radiographs: </strong>
                                                {selectedPatient.dental_xrays_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Nutritional Balance and Diet Quality: </strong>
                                                {selectedPatient.balanced_diet_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Tobacco Use Frequency: </strong>
                                                {selectedPatient.smoke_frequency_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Engagement in Athletic Activities: </strong>
                                                {selectedPatient.participate_in_sports_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Previous Dental Restorations: </strong>
                                                {selectedPatient.dental_restoration_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">History of Orthodontic Interventions: </strong>
                                                {selectedPatient.orthodontic_treatment_details || "N/A"}
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
