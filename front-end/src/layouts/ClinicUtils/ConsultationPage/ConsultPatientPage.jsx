import {
    useState,
    useCallback,
    useEffect
} from "react";
import {
    useLocation,
    useNavigate
} from "react-router-dom";
import {
    Step,
    StepLabel,
    Stepper
} from "@mui/material";
import PatientInformationStepper from "./PatientInformationPage";
import MedicalHistoryStepper from "./MedicalHistory";
import LifeStyleInformationStepper from "./LifeStyleInformationStepper";
import ClinicAssessmentStepper from "./ClinicAssessmentStepper";
import ConsentAndAgreementStepper from "./ConsentAndAgreementStepper";
import dayjs from "dayjs";
import CMS from "../../../API/CMS";
import AppointmentDataNotFoundDialog from "../../../utils/AppoimtmentDataNotFound";
import OralHygieneStepper from "./OralHygieneStepper";
import PatientConsultationSuccessfulDialog from "../../../utils/PatientConsultationSuccessfulDialog";

const ConsultationPatientPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [fieldErrors, setFieldErrors] = useState({
        // patient information states
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        appointmentDate: null,
        preferredTime: null,
        // medical history state
        allergiesDetails: "",
        takingPrescriptionMedicationDetails: "",
        chronicConditionDetails: "",
        surgeriesDetails: "",
        jawPainDetails: "",
        experiencedExcessiveBleedingDetails: "",
        heartProblemsDetails: "",
        advisedTakingAntibioticsDetails: "",
        // lifestyle information state
        smokeDetails: "",
        consumeSugaryFoodsOrDrinksDetails: "",
        dentalFlossDetails: "",
        consumeAlcoholDetails: "",
        participateInSportsDetails: "",
        balancedDietDetails: "",
        regularExerciseDetails: "",
        eatingDisordersDetails: "",
        // clinic assessment state
        experienceBleedingDetails: "",
        toothSensitivityDetails: "",
        dentalAppearanceDetails: "",
        looseTeethDetails: "",
        badBreathOrBadTasteDetails: "",
        dentalXraysDetails: "",
        dentalRestorationDetails: "",
        orthodonticTreatmentDetails: "",
        // oral hygiene state
        brushFrequencyDetails: "",
        useMouthWashDetails: "",
        replaceToothbrushDetails: "",
        cleanTongueDetails: "",
        regularCheckupDetails: "",
        dentalAnxietyDetails: "",
        dentalTraumaDetails: "",
        consent: ""
    });

    const [patientFormData, setPatientFormData] = useState({
        // patient information state
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        appointmentDate: null,
        preferredTime: null,
        // medical history state
        allergiesDetails: "",
        takingPrescriptionMedicationDetails: "",
        chronicConditionDetails: "",
        surgeriesDetails: "",
        jawPainDetails: "",
        experiencedExcessiveBleedingDetails: "",
        heartProblemsDetails: "",
        advisedTakingAntibioticsDetails: "",
        // lifestyle information state
        smokeDetails: "",
        consumeSugaryFoodsOrDrinksDetails: "",
        dentalFlossDetails: "",
        consumeAlcoholDetails: "",
        participateInSportsDetails: "",
        balancedDietDetails: "",
        regularExerciseDetails: "",
        eatingDisordersDetails: "",
        // clinic assessment state
        experienceBleedingDetails: "",
        toothSensitivityDetails: "",
        dentalAppearanceDetails: "",
        looseTeethDetails: "",
        badBreathOrBadTasteDetails: "",
        dentalXraysDetails: "",
        dentalRestorationDetails: "",
        orthodonticTreatmentDetails: "",
        // oral hygiene state
        brushFrequencyDetails: "",
        useMouthWashDetails: "",
        replaceToothbrushDetails: "",
        cleanTongueDetails: "",
        regularCheckupDetails: "",
        dentalAnxietyDetails: "",
        dentalTraumaDetails: "",
        // consent and agreement state
        consent: "",
        appointmentID: "",
        clinic_name: "",
        admin_id: ""
    });
    const [openAppointmentDataNotFoundDialog, setOpenAppointmentDataNotFoundDialog] = useState(false);
    const [medicalHistoryFieldNames, setMedicalHistoryFieldNames] = useState([]);
    const [lifestyleInformationFieldNames, setLifestyleInformationFieldNames] = useState([]);
    const [clinicalAssessmentFieldNames, setClinicalAssessementFieldNames] = useState([]);
    const [oralHygieneFieldNames, setOralHygieneFieldNames] = useState([]);
    const [openPatientConsultationSuccessfulDialog, setOpenPatientConsultationSuccessfulDialog] = useState(false);  

    const steps = [
        "Patient Information",
        "Medical History",
        "Lifestyle Information",
        "Clinic Assessments",
        "Oral Hygiene",
        "Consent and Agreement",
    ];

    const location = useLocation();
    const appointmentData = location.state?.appointmentData;

    // retrieving the patient form data from the approved appointment table component
    useEffect(() => {
        if (!appointmentData || !appointmentData.appointmentID) {
            setOpenAppointmentDataNotFoundDialog(true);
            return;
        }

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
        }));
    }, [appointmentData, navigate]);

    const handleCloseTheAppointmentDataNotFoundDialog = async () => {
        setOpenAppointmentDataNotFoundDialog(false);
        navigate("/doctor-portal/dashboard/ApprovedAppointments", {
            replace: true
        });
    }
    
    // function for handling the input during changing
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setPatientFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" && name === "consent" ? checked ? "Yes" : "No" : value
        }));

        if (fieldErrors[name]) {
            setFieldErrors((prev) => ({
                ...prev,
                [name]: ""
            }));
        }
    };

    // function for handling the appointment date change
    const handleAppointmentDateChange = useCallback((newValue) => {
        setPatientFormData((prev) => ({
            ...prev,
            appointmentDate: newValue && dayjs(newValue) ? newValue : null
        }));

        if (fieldErrors.appointmentDate) {
            setFieldErrors((prev) => ({
                ...prev,
                appointmentDate: null
            }));
        }
    }, [fieldErrors]);

    const handleCallBackTimePickerChange = useCallback((newValue) => {
        setPatientFormData((prev) => ({
            ...prev,
            preferredTime: newValue && dayjs(newValue) ? newValue : null
        }));
        if (fieldErrors.preferredTime) {
            setFieldErrors((prev) => ({
                ...prev,
                preferredTime: null
            }));
        }
    }, [fieldErrors]);

    // function to submit the consultation multi step form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (patientFormData?.consent !== "Yes") {
                setFieldErrors((prev) => ({
                    ...prev,
                    consent: "Consent is required. You must agree to the terms and privacy policy.."
                }));
                return;
            }

            const response = await CMS.post("/CMS/clinic-dashboard/consultPatient", {
                ...patientFormData,
                admin_id: localStorage.getItem("sid"),
                clinic_name: patientFormData.clinic_name,
                appointmentID: patientFormData.appointmentID
            }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                },
            });

            if (response.status === 200) {
                setFieldErrors({});
                setOpenPatientConsultationSuccessfulDialog(true);
            }
        } catch (error) {
            if (error?.response?.status === 400) {
                setFieldErrors((prev) => ({
                    ...prev,
                    ...error.response.data.errors
                }));
            }
            console.error("Error in consultation form:", error);
        }
    };

    // function to handle next steps in patient consultation
    const handleNext = async () => {
        // display the error message in the relevant field
        const stepFields = [
            ["firstName", "lastName", "email", "phoneNumber", "appointmentDate", "preferredTime"],
            medicalHistoryFieldNames, // dynamically render the fieldnames based on the retrieved medical history questionnaires
            lifestyleInformationFieldNames, // dynamically render the fieldnames based on the retrieved lifestyle information questionnaires
            clinicalAssessmentFieldNames, // dynamically render the fieldnames based on the retrieved clinical assessment questionnaires
            oralHygieneFieldNames, // dynamically render the fieldnames based on the retrieved oral hygiene questionnaires
            ["consent"]
        ];

        const currentFields = stepFields[activeStep];
        const currentData = currentFields.reduce((data, field) => {
            data[field] = patientFormData[field];
            return data;
        }, {});

        try {
            const response = await CMS.post(`/CMS/clinic-dashboard/validatePatientConsultation/${activeStep}`, currentData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                }
            });

            if (response.status === 200) {
                setFieldErrors((prev) => {
                    const updated = { ...prev };
                    currentFields.forEach((field) => delete updated[field]);
                    return updated;
                });
                setActiveStep((prev) => prev + 1);
            }
        } catch (error) {
            if (error?.response?.status === 400) {
                setFieldErrors((prev) => ({
                    ...prev,
                    ...error.response.data.errors
                }));
            } else {
                console.error("Validation steo error in function handle next:", error);
            }
        }
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    // components of consultation steps
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
                );
            case 1:
                return (
                    <MedicalHistoryStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                        setDynamicFieldNames={setMedicalHistoryFieldNames}
                    />
                );
            case 2:
                return (
                    <LifeStyleInformationStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                        setDynamicLifeStyleInformationFieldNames={setLifestyleInformationFieldNames}
                    />
                );
            case 3:
                return (
                    <ClinicAssessmentStepper
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                        setDynamicClinicalAssessmentFieldNames={setClinicalAssessementFieldNames}
                    />
                );
            case 4: 
                return (
                    <OralHygieneStepper 
                        patientFormData={patientFormData}
                        handleChange={handleChange}
                        fieldErrors={fieldErrors}
                        setDynamicOralHygieneFieldNames={setOralHygieneFieldNames}
                    />
                )
            case 5:
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

    // function for closing the dialog box of patient consultation successful dialog
    const handleClosePatientConsultationSuccessfulDialog = async () => {
        setOpenPatientConsultationSuccessfulDialog(false);
        navigate("/doctor-portal/dashboard/AppointmentHistory");
    }

    return (
        <div className="flex justify-center items-center min-h-[90vh] px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 lg:p-10 shadow-2xl rounded-3xl w-full max-w-[50vw] min-h-[50vh]">
                <div className="flex justify-center items-center mb-6 flex-col mx-auto py-10 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-center mb-6">
                        Patient Consultation Steps
                    </h2>
                    <Stepper activeStep={activeStep} className="mb-4 mt-4" alternativeLabel>
                        {steps.map((label) => (
                            <Step key={label}>
                                <StepLabel>{label}</StepLabel>
                            </Step>
                        ))}
                    </Stepper>
                    <form
                        onSubmit={handleSubmit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") e.preventDefault();
                        }}
                    >
                        <div className="mb-6 sm:mb-8">
                            {renderStepContent(activeStep)}
                        </div>

                        <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-4 mt-4 gap-4">
                            <button
                                type="button"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                color="primary"
                                className="text-sm sm:text-base bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500 disabled:opacity-50 cursor-pointer"
                            >
                                Back
                            </button>
                            {activeStep === steps.length - 1 ? (
                                <button
                                    type="submit"
                                    color="primary"
                                    className="text-sm sm:text-base bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    Submit
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    color="primary"
                                    className="text-sm sm:text-base bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    Next
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <AppointmentDataNotFoundDialog
                isOpen={openAppointmentDataNotFoundDialog}
                onClose={handleCloseTheAppointmentDataNotFoundDialog}
            />
            <PatientConsultationSuccessfulDialog
                open={openPatientConsultationSuccessfulDialog}
                onClose={handleClosePatientConsultationSuccessfulDialog}
            />
        </div>

    );
};

export default ConsultationPatientPage;
