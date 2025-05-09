import {
    useState,
    useCallback,
    useEffect
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Paper,
    Stepper,
    Step,
    StepLabel,
    Button,
    Typography,
    Divider,
} from "@mui/material";
import PatientInformationStepper from "./PatientInformationPage";
import MedicalHistoryStepper from "./MedicalHistory";
import LifeStyleInformationStepper from "./LifeStyleInformationStepper";
import ClinicAssessmentStepper from "./ClinicAssessmentStepper";
import ConsentAndAgreementStepper from "./ConsentAndAgreementStepper";
import dayjs from "dayjs";
import CMS from "../../../API/CMS";

const ConsultationPatientPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        appointmentDate: null,
        preferredTime: null,
        medicalConditionDetails: "",
        medicationDetails: "",
        cardioVascularDetails: "",
        smokeFrequency: "",
        allergyDetails: "",
        alcoholFrequency: "",
        exerciseFrequency: "",
        diagnosis: "",
        symptoms: "",
        prescription: "",
        treatmentPlan: "",
        consent: "",
    });
    const [patientFormData, setPatientFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        appointmentDate: null,
        preferredTime: null,
        medicalConditionDetails: "",
        medicationDetails: "",
        cardioVascularDetails: "",
        smokeFrequency: "",
        allergyDetails: "",
        alcoholFrequency: "",
        exerciseFrequency: "",
        diagnosis: "",
        symptoms: "",
        prescription: "",
        treatmentPlan: "",
        consent: "",
        appointmentID: "",
        clinic_name: "",
        admin_id: "",
    })

    const steps = [
        "Patient Information",
        "Medical History",
        "Lifestyle Information",
        "Clinic Assessments",
        "Consent and Agreement",
    ];

    const location = useLocation();

    const { appointmentData } = location.state;


    useEffect(() => {
        const retrievedAppointmentData = async () => {
            if (appointmentData) {
                setPatientFormData((prev) => ({
                    ...prev,
                    firstName: appointmentData.firstName,
                    lastName: appointmentData.lastName,
                    email: appointmentData.email,
                    phoneNumber: appointmentData.phoneNumber,
                    appointmentDate: appointmentData.appointmentDate,
                    preferredTime: appointmentData.preferredTime ? dayjs(appointmentData.preferredTime, "HH:mm") : null,
                    appointmentID: appointmentData.appointmentID,
                    clinic_name: appointmentData.clinic_name,
                }))
            }
        }
        retrievedAppointmentData();
    }, [appointmentData])

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPatientFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));

        if (fieldErrors[name]) {
            setFieldErrors(prev => ({
                ...prev,
                [name]: "",
            }));
        }
    }

    const handleAppointmentDateChange = useCallback(async (newValue) => {
        const handleChangeInput = (newValue) => {
            setPatientFormData((prev) => ({
                ...prev,
                appointmentDate: newValue && dayjs(newValue) ? newValue : ""
            }));

            if (fieldErrors.appointmentDate) {
                setFieldErrors({
                    ...fieldErrors,
                    appointmentDate: ""
                });
            }
        }
        handleChangeInput(newValue)
    }, [fieldErrors])

    const handleCallBackTimePickerChange = useCallback(async (newValue) => {
        const handleChangeInput = (newValue) => {
            setPatientFormData((prev) => ({
                ...prev,
                preferredTime: newValue && dayjs(newValue) ? newValue : ""
            }));

            if (fieldErrors.preferredTime) {
                setFieldErrors({
                    ...fieldErrors,
                    preferredTime: ""
                });
            }
        }
        handleChangeInput(newValue)
    }, [fieldErrors])

    // Function to consult the patient information
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure consent is provided before submission
            if (patientFormData.consent !== "Yes") {
                setFieldErrors((prev) => ({
                    ...prev,
                    consent: !patientFormData.consent ? "Consent is required. You must agree to the terms and privacy policy.." : ""
                }));
                return;
            }

            // API endpoint to submit the consultation form
            const response = await CMS.post("/CMS/clinic-dashboard/consultPatient", {
                ...patientFormData,
                admin_id: localStorage.getItem("sid"),
                clinic_name: patientFormData.clinic_name,
                appointmentID: patientFormData.appointmentID
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}` // Ensure token is included
                },
            });

            if (response.status === 200) {
                setFieldErrors({});
                alert("Consulted Patient Successfully!");
                navigate("/doctor-portal/dashboard/appointment-history");
            }
        } catch (error) {
            if (error?.response && error.response?.status === 400) {
                const fieldErrors = error.response.data.errors;
                setFieldErrors((prev) => ({
                    ...prev,
                    ...fieldErrors
                }));
            }
            console.error(`Code functionality error in consultation form: ${error}`);
        }
    }
    
    // function for proceeding to the next step
    const handleNext = async () => {
        try {
            const stepFields = [
                ["firstName", "lastName", "email", "phoneNumber", "appointmentDate", "preferredTime"],
                ["medicalConditionDetails", "medicationDetails", "cardioVascularDetails"],
                ["smokeFrequency", "allergyDetails", "alcoholFrequency", "exerciseFrequency"],
                ["diagnosis", "symptoms", "prescription", "treatmentPlan"],
                ["consent"]
            ];

            // Ensure the activeStep is within bounds
            if (activeStep < 0 || activeStep >= stepFields.length) {
                console.error("Invalid step index");
                return;
            }

            // Get the fields for the current step
            const currentStepFields = stepFields[activeStep];
            const currentStepData = currentStepFields.reduce((data, field) => {
                data[field] = patientFormData[field];
                return data;
            }, {});

            // Send the current step's data to the backend for validation
            const response = await CMS.post(
                `/CMS/clinic-dashboard/validatePatientConsultation/${activeStep}`,
                currentStepData,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}` // Ensure token is included
                    },
                }
            );
            
            // If validation is successful, clear errors and move to the next step
            if (response.status === 200) {
                const currentStepFields = stepFields[activeStep];
                setFieldErrors((prev) => {
                    const updatedErrors = { ...prev };
                    currentStepFields.forEach((field) => {
                        delete updatedErrors[field];
                    });
                    return updatedErrors;
                });
                setActiveStep((prev) => prev + 1);
            }
        } catch (error) {
            // Handle backend validation errors
            if (error?.response && error.response?.status === 400) {
                const fieldErrors = error.response.data.errors;
                
                // Map backend validation errors to the frontend state
                setFieldErrors((prev) => ({
                    ...prev,
                    ...fieldErrors,
                }));
            } else {
                console.error(`Code functionality error in validation step component: ${error}`);
            }
        }
    };

    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    }

    const renderStepContent = (step) => {
        switch (step) {
            case 0:
                return (
                    <PatientInformationStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                        handleAppointmentDateChange={handleAppointmentDateChange}
                        handleCallBackTimePickerChange={handleCallBackTimePickerChange}
                    />
                )
            case 1:
                return (
                    <MedicalHistoryStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 2:
                return (
                    <LifeStyleInformationStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 3:
                return (
                    <ClinicAssessmentStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                    />
                );
            case 4:
                return (
                    <ConsentAndAgreementStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                    />
                );
            default:
                return null;
        }
    };


    return (
        <Container className="py-10 flex justify-center items-center mt-28">
            <Paper className="p-10 shadow-2xs rounded-4xl flex-col flex items-center justify-center max-w-full">
                <Typography variant="h5" className="text-center mb-8 font-bold">
                    Patient Consultation Steps
                </Typography>

                <Stepper activeStep={activeStep} className="mb-4 mt-4">
                    {steps.map((label, index) => (
                        <Step key={index}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <form
                    className="space-y-6"
                    onSubmit={(e) => handleSubmit(e)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            e.preventDefault();
                        }
                    }}
                >
                    <Box className="mb-8">
                        {renderStepContent(activeStep)}
                    </Box>
                    <Divider className="my-6" />
                    <Box className="flex justify-end gap-4 mt-4">
                        <Button
                            disabled={activeStep === 0}
                            onClick={handleBack}
                            variant="outlined"
                            className="mr-4"
                            color="primary"
                        >
                            Back
                        </Button>
                        {activeStep === steps.length - 1 ? (
                            <Button
                                type="submit"
                                variant="contained"
                                color="primary"
                            >
                                Submit
                            </Button>
                        ) : (
                            <Button
                                type="button"
                                onClick={handleNext}
                                variant="contained"
                                color="primary"
                            >
                                Next
                            </Button>
                        )}
                    </Box>
                </form>
            </Paper>
        </Container>
    )
}

export default ConsultationPatientPage;