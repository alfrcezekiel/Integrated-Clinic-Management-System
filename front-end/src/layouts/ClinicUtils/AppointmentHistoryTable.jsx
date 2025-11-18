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
    Button
} from "@mui/material";
import CMS from "../../API/CMS";
import HistoryIcon from "@mui/icons-material/History";
import CloseIcon from "@mui/icons-material/Close";
import { useAuthorization } from "../../context/auth/useAuthorization";
import { jsPDF } from "jspdf";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf"

// Field configurations for different clinic types
const clinicFieldConfigs = {
    "Dental Clinic": {
        patientInfo: {
            firstName: "patient_first_name",
            lastName: "patient_last_name",
            email: "patient_email",
            phoneNumber: "phone_number"
        },
        medicalHistory: [
            { label: "Documented Allergic Reactions", field: "allergy_details" },
            { label: "Current Prescription Medications", field: "taking_prescription_medication_details" },
            { label: "Chronic Health Conditions", field: "chronic_condition_details" },
            { label: "Temporomandibular Joint (TMJ) or Jaw Pain History", field: "history_of_jaw_pain_details" },
            { label: "History of Excessive Bleeding", field: "experienced_excessive_bleeding_details" },
            { label: "Cardiovascular History", field: "past_history_of_cardiovascular_issues" },
            { label: "Prophylactic Antibiotic Recommendation", field: "advised_taking_antibiotics_details" },
            { label: "Surgical History", field: "past_surgeries_details" }
        ],
        lifestyleAssessment: [
            { label: "Gingival Bleeding History", field: "experience_bleeding_details" },
            { label: "Dental Sensitivity Description", field: "tooth_sensitivity_details" },
            { label: "Concerns Regarding Dental Aesthetics", field: "dental_appearance_details" },
            { label: "Tooth Mobility Observations", field: "loose_teeth_details" },
            { label: "Regular Physical Activity", field: "regular_exercise_details" },
            { label: "Alcohol Consumption Habits", field: "consume_alcohol_details" },
            { label: "Dental Floss Usage", field: "dental_floss_details" },
            { label: "Intake of Sugary Foods or Beverages", field: "consume_sugary_foods_or_beverages_details" },
            { label: "Oral Malodor or Dysgeusia", field: "bad_breath_or_bad_taste_details" },
            { label: "Recent Dental Radiographs", field: "dental_xrays_details" },
            { label: "Nutritional Balance and Diet Quality", field: "balanced_diet_details" },
            { label: "Tobacco Use Frequency", field: "smoke_frequency_details" },
            { label: "Engagement in Athletic Activities", field: "participate_in_sports_details" },
            { label: "Previous Dental Restorations", field: "dental_restoration_details" },
            { label: "History of Orthodontic Interventions", field: "orthodontic_treatment_details" },
            { label: "Brushing Frequency", field: "brush_frequency_details" },
            { label: "Mouthwash Usage", field: "use_mouthwash_details" },
            { label: "Toothbrush Replacement Frequency", field: "replace_toothbrush_details" },
            { label: "Tongue Cleaning Practices", field: "clean_tongue_details" },
            { label: "Regular Dental Check-up Attendance", field: "regular_checkup_details" },
            { label: "Dental Anxiety Level", field: "dental_anxiety_details" },
            { label: "History of Dental Trauma", field: "dental_trauma_details" },
            { label: "Eating Disorder History", field: "eating_disorder_details" }
        ]
    },
    "Psychiatry Clinic": {
        patientInfo: {
            firstName: "first_name",
            lastName: "last_name",
            email: "email",
            phoneNumber: "phone_number"
        },
        medicalHistory: [
            { label: "Diagnosed Mental Health Conditions", field: "diagnosed_mental_health_condition_details" },
            { label: "Current Psychiatric Medications", field: "taking_psychiatric_medication_details" },
            { label: "History of Psychiatric Hospitalization", field: "hospitalized_for_mental_health_reason_details" },
            { label: "Family History of Mental Health Conditions", field: "family_history_of_mental_health_condition_details" },
            { label: "Suicidal Thoughts or Behaviors", field: "suicidal_thoughts_or_behavior_details" },
            { label: "Self-Harm or Suicide Attempts", field: "self_harm_or_suicide_details" },
            { label: "Counseling or Therapy History", field: "counseling_or_therapy_details" },
            { label: "Emotional or Behavioral Patterns", field: "emotional_or_behavioral_patterns_details" }
        ],
        lifestyleAssessment: [
            { label: "Mood Patterns", field: "mood_details" },
            { label: "Excessive Worry or Anxiety", field: "excessive_worry_or_anxiety_details" },
            { label: "Sleep Patterns", field: "sleep_patterns_details" },
            { label: "Appetite or Weight Changes", field: "appetite_or_weight_details" },
            { label: "Sleep Changes", field: "sleep_changes_details" },
            { label: "Feelings of Hopelessness or Worthlessness", field: "hopelessness_or_worthlessness_details" },
            { label: "Agitation or Impulsivity", field: "agitation_or_impulsivity_details" },
            { label: "Difficulty Concentrating", field: "difficulty_concentrating_details" },
            { label: "Stress Levels", field: "stress_level_details" },
            { label: "Support System", field: "support_system_details" },
            { label: "Major Life Changes", field: "major_life_changes_details" },
            { label: "Substance Use", field: "substances_details" },
            { label: "Sleep Hours", field: "sleep_hours_details" },
            { label: "Social Groups", field: "social_group_details" },
            { label: "Living Situation", field: "living_situation_details" },
            { label: "Coping with Stress", field: "coping_with_stress_details" },
            { label: "Mental Health Treatment History", field: "mental_health_treatment_details" },
            { label: "Previous Treatment History", field: "treatment_history_details" },
            { label: "Currently in Therapy", field: "currently_in_therapy_details" },
            { label: "Negative Experience with Mental Health Treatment", field: "negative_experience_with_mental_health_treatment_details" },
            { label: "Currently Under Care of Psychiatrist", field: "currently_undercare_of_psychiatrist_details" },
            { label: "Stopped Taking Psychiatric Medications", field: "stopped_taking_psychiatric_medication_details" },
            { label: "Side Effects from Psychiatric Medications", field: "side_effects_from_psychiatric_medication_details" },
            { label: "Consistent with Therapy/Medication Attendance", field: "consistent_with_attending_therapy_or_taking_medication_details" }
        ]
    }
};

const AppointmentHistoryTable = () => {
    /**
     * @function to add a section in PDF 
     */
    const addSection = async (doc, title, yPos, margin, pageWidth) => {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(14);
        doc.text(title.toUpperCase(), margin, yPos);
        doc.setDrawColor(41, 128, 185);
        doc.setLineWidth(0.5);
        doc.line(margin, yPos + 2, pageWidth - margin, yPos + 2);
        return yPos + 10;
    }

    /**
     * @function to add a new page if the canvas breaks
     */
    const addPage = (doc, currentY, requiredSpace = 50) => {
        const pageHeight = doc.internal.pageSize.getHeight();
        if (currentY + requiredSpace > pageHeight) {
            doc.addPage();
            return 20;
        }
        return currentY;
    }

    /**
     * @function to add a key-value in PDF
     */
    const addKeyValue = async (doc, key, value, yPos, margin, maxWidth, isSubItem = false) => {
        const startX = isSubItem ? margin + 10 : margin;
        const keyWidth = isSubItem ? 40 : 80;
        const valueStart = startX + keyWidth + 2;

        /**
         * sets the font and font size for the key
         */
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.text(key, startX, yPos);

        /**
         * splits value into multiple lines if needed
         */
        const splitValue = doc.splitTextToSize(String(value || "N/A"), maxWidth - keyWidth - 5);

        doc.setFont("helvetica", "normal");
        doc.text(splitValue, valueStart, yPos);

        /**
         * calculate the new Y position based on number of lines
         */
        const lineHeight = 7;
        const valueHeight = splitValue.length * lineHeight;

        return yPos + Math.max(10, valueHeight + 3);
    }

    /**
     * @function to auto-genereate a medical history and appointment details and download PDF
     */
    const autoGenerateAndDownloadPDF = async (patient) => {
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - 2 * margin;
        let yPos = 20;

        /**
         * add header
         */
        doc.setFontSize(18);
        doc.setFont("helvetica", "bold");
        doc.text("Medical Consultation Report", pageWidth / 2, yPos, { align: "center" });
        yPos += 10;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(patient.clinic_name, pageWidth / 2, yPos, { align: "center" })
        yPos += 20;

        /**
         * Patient Information Section
         */
        yPos = await addSection(doc, "Patient Information", yPos, margin, pageWidth);

        /**
         * Patient Details 
         */
        yPos = await addKeyValue(doc, "Name", `${patient.patient_first_name} ${patient.patient_last_name}`, yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Email", `${patient.patient_email}` || "", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Phone Number", `${patient.phoneNumber}` || "", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Appointment Date", `${dateFormat(patient.appointment_date)}` || "", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Appointment Time", `${formatTimeToAMPM(patient.appointment_time)}` || "", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Gender", `${patient.gender}` || " ", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Status", `${patient.status}` || "", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Purpose of Appointment", `${patient.purposeOfAppointment}` || "", yPos, margin, maxWidth);

        yPos += 5;
        /**
         * Medical History Section
         */
        yPos = await addSection(doc, "Medical History", yPos, margin, pageWidth);

        /**
         * medical history details
         */
        yPos = await addKeyValue(doc, "Allergies", `${patient.allergy_details}` || "None Reported", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Current Medications", `${patient.taking_prescription_medication_details}` || "None", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Chronic Condition", `${patient.chronic_condition_details}` || "None Reported", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Surgical History", `${patient.past_surgeries_details}` || "None", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Cardiovascular History", `${patient.past_history_of_cardiovascular_issues}` || "None Reported", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Dental History", `${patient.dental_restoration_details}` || "None", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Orthodontic History", `${patient.orthodontic_treatment_details}` || "None", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "Dental Trauma", `${patient.dental_trauma_details}`, yPos, margin, maxWidth);

        yPos += 5;
        /**
         * Lifestyle Assessment Section
         */
        yPos = addPage(doc, yPos, 50);
        yPos = await addSection(doc, "Lifestyle Assessment", yPos, margin, pageWidth);

        /**
         * lifestyle assessment details
         */
        yPos = await addKeyValue(doc, "Oral Hygiene", " ", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "• Brushing: ", `${patient.brush_frequency_details}` || "Not specified", yPos, margin, maxWidth, true);
        yPos = await addKeyValue(doc, "• Flossing: ", `${patient.dental_floss_details}` || "Not specified", yPos, margin, maxWidth, true);
        yPos = await addKeyValue(doc, "• Mouthwash: ", `${patient.use_mouthwash_details}` || "Not specified", yPos, margin, maxWidth, true);
        yPos = addPage(doc, yPos, 50);

        yPos = await addKeyValue(doc, "Habits", " ", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "• Tobbaco Use: ", `${patient.smoke_frequency_details}` || "None", yPos, margin, maxWidth, true);
        yPos = await addKeyValue(doc, "• Alcohol Use: ", `${patient.consume_alcohol_details}` || "None", yPos, margin, maxWidth, true);

        yPos = await addKeyValue(doc, "Diet & Exercises", " ", yPos, margin, maxWidth);
        yPos = await addKeyValue(doc, "• Diet: ", `${patient.balanced_diet_details}` || "Not specified", yPos, margin, maxWidth, true);
        yPos = await addKeyValue(doc, "• Exercises: ", `${patient.regular_exercise_details}` || "Not specified", yPos, margin, maxWidth, true);
        yPos = await addKeyValue(doc, "• Dental Anxiety: ", `${patient.dental_anxiety_details}` || "Not specified", yPos, margin, maxWidth, true);

        yPos += 5;
        /**
         * Footer
         */
        const pageCount = doc.internal.getNumberOfPages();
        for (let i = 1; i <= pageCount; i++) {
            doc.setPage(i);
            const currentPageHeight = doc.internal.pageSize.getHeight();

            doc.setFontSize(10);
            doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, currentPageHeight - 1, { align: "center" });

            const footerY = doc.internal.pageSize.getHeight() - 20;
            if (i === pageCount) {
                doc.setFontSize(10);
                doc.setFont("helvetica", "italic");
                doc.text("This is a system-generated document. No signature is required.", pageWidth / 2, footerY, { align: "center" });
                doc.text(`Generated on ${new Date().toLocaleDateString()}`, pageWidth / 2, footerY + 5, { align: "center" });
            }
        }

        doc.save(`Medical_Report_${patient.patient_first_name}_${patient.patient_last_name}_${new Date().toISOString().split("T")[0]}.pdf`);
    }

    const appointmentsTableColumn = [
        "Clinic Name",
        "Full Name",
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

    const clinicID = user?.sid;
    const tokenContext = token;
    const clinicType = user?.stype;

    if (!tokenContext && !clinicID) {
        console.error("No token and clinic id found in context or localStorage");
        setAppointmentHistoryData([]);
    }

    const retrieveAppointmentHistory = useCallback(async () => {
        try {
            const response = await CMS.get(`/clinic-dashboard/getAppointmentHistory`, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`,
                },
                params: {
                    clinicID: clinicID,
                    clinicType: clinicType
                }
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
    }, [clinicID, tokenContext, clinicType]);

    useEffect(() => {
        const titleHeader = () => {
            document.title = "Patient's Appointment History | CMS";
        };
        titleHeader();

        retrieveAppointmentHistory();
    }, [location.pathname, clinicID, tokenContext, retrieveAppointmentHistory]);

    /**
     * @function to auto-generate a medical history using PDF
     */

    const autoGenerateMedicalReport = async (patient) => {
        try {
            const tokenContext = token;
            const response = await CMS.post(`/cms.api.com/clinic/dashboard/autoGenerateMedicalReport`, { patient: patient }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                },
                params: {
                    appointmentID: patient.appointmentID
                }
            })

            if (response.status === 200) {
                const data = response.data.downloadURL;
                window.open(data, "_blank");
            } else {
                throw new Error(`Error in response status code`)
            }
        } catch (error) {
            console.error(`Failed to auto generate a medical report: ${error}`)
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
                                                    className="text-black"
                                                >
                                                    {appointment.clinic_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-black"
                                                >
                                                    {appointment[clinicFieldConfigs[clinicType]?.patientInfo?.firstName] || appointment.patient_first_name} {appointment[clinicFieldConfigs[clinicType]?.patientInfo?.lastName] || appointment.patient_last_name}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-black"
                                                >
                                                    {appointment[clinicFieldConfigs[clinicType]?.patientInfo?.email] || "patient_email"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-black"
                                                >
                                                    {dateFormat(appointment.appointment_date)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-black"
                                                >
                                                    {formatTimeToAMPM(appointment.appointment_time)}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-black"
                                                >
                                                    {appointment[clinicFieldConfigs[clinicType]?.patientInfo?.phoneNumber] || "phoneNumber"}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-black"
                                                >
                                                    {appointment.gender}
                                                </Typography>
                                            </TableCell>
                                            <TableCell align="center">
                                                <Typography
                                                    variant="body2"
                                                    className="text-black"
                                                >
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
                                                className="text-black"
                                            >
                                                No consulted patients available.
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
                        <div>
                            <Button
                                variant="contained"
                                color="error"
                                startIcon={<PictureAsPdfIcon />}
                                onClick={() => autoGenerateMedicalReport(selectedPatient) || autoGenerateAndDownloadPDF(selectedPatient)}
                                className="mr-2"
                                size="small"
                            >
                                Print Medical History
                            </Button>
                        </div>
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
                                                {selectedPatient[clinicFieldConfigs[clinicType]?.patientInfo?.firstName] || "patient_first_name"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Last Name: </strong>
                                                {selectedPatient[clinicFieldConfigs[clinicType]?.patientInfo?.lastName] || "patient_last_name"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Email: </strong>
                                                {selectedPatient[clinicFieldConfigs[clinicType]?.patientInfo?.email] || "patient_email"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1 sm:col-span-2">
                                                <strong className="text-sm/6">Phone Number: </strong>
                                                {selectedPatient[clinicFieldConfigs[clinicType]?.patientInfo?.phoneNumber] || "patient_phone_number"}
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
                                            {clinicFieldConfigs[clinicType]?.medicalHistory?.map((item, index) => (
                                                <div key={index} className="col-span-2 md:col-span-1 sm:col-span-2">
                                                    <strong className="text-sm/6">{item.label}: </strong>
                                                    {selectedPatient[item.field] || "N/A"}
                                                </div>
                                            ))}
                                            {/* <div className="col-span-2 md:col-span-1 sm:col-span-2">
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
                                            </div> */}
                                        </div>
                                    </section>
                                    <section className="bg-white p-4 rounded-xl shadow-lg">
                                        <h3 className="text-lg font-semibold text-black mb-4">
                                            Lifestyle and Clinical Assessment Overview
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
                                            {clinicFieldConfigs[clinicType]?.lifestyleAssessment?.map((item, index) => (
                                                <div key={index} className="col-span-2 md:col-span-1 sm:col-span-2">
                                                    <strong className="text-sm/6">{item.label}: </strong>
                                                    {selectedPatient[item.field] || "N/A"}
                                                </div>
                                            ))}
                                            {/* <div className="col-span-2 md:col-span-1">
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
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Brushing Frequency: </strong>
                                                {selectedPatient.brush_frequency_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Use of Mouthwash: </strong>
                                                {selectedPatient.use_mouthwash_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Replacement of Toothbrush: </strong>
                                                {selectedPatient.replace_toothbrush_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Cleaning of Tongue: </strong>
                                                {selectedPatient.clean_tongue_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Regular Dental Checkups: </strong>
                                                {selectedPatient.regular_checkup_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Dental Anxiety: </strong>
                                                {selectedPatient.dental_anxiety_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">History of Dental Trauma: </strong>
                                                {selectedPatient.dental_trauma_details || "N/A"}
                                            </div>
                                            <div className="col-span-2 md:col-span-1">
                                                <strong className="text-sm/6">Eating Disorders: </strong>
                                                {selectedPatient.eating_disorder_details || "N/A"}
                                            </div> */}
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
