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
import ConsentAndAgreementStepper from "./ConsentAndAgreementStepper";
import dayjs from "dayjs";
import CMS from "../../../API/CMS";
import AppointmentDataNotFoundDialog from "../../../utils/AppoimtmentDataNotFound";
import PatientConsultationSuccessfulDialog from "../../../utils/PatientConsultationSuccessfulDialog";
import { useAuthorization } from "../../../context/auth/useAuthorization.jsx";
import { useClinicFormState } from "../../../hooks/ClinicStatsHooks/useClinicFormState";
import { CLINIC_TYPES } from "../../../constants/clinicTypes.js";
import DynamicSection from "./DynamicSection.jsx";

const ConsultationPatientPage = () => {
    const navigate = useNavigate();
    const [activeStep, setActiveStep] = useState(0);
    const [openAppointmentDataNotFoundDialog, setOpenAppointmentDataNotFoundDialog] = useState(false);
    const [openPatientConsultationSuccessfulDialog, setOpenPatientConsultationSuccessfulDialog] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [steps, setSteps] = useState([]);
    const [loadingSections, setLoadingSections] = useState(false);

    const { token, user } = useAuthorization();
    const clinicID = user.sid;
    const tokenContext = token;
    if (!tokenContext) {
        console.error("Token is not available in the context or local storage.");
    }

    // Function to retrieve sections dynamically based on clinic type
    const retrieveSections = useCallback(async (clinicID) => {
        if (!clinicID) {
            console.error("Clinic ID is required to retrieve sections");
            return;
        }

        try {
            setLoadingSections(true);
            const response = await CMS.get("/cms.api.com/clinic/consultation_questionnaire_sections", {
                params: {
                    clinicID: clinicID
                },
                headers: {
                    "Authorization": `Bearer ${tokenContext}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 200 && response.data.sections) {
                setSteps(response.data.sections);
            } else {
                throw new Error("Failed to retrieve sections from server");
            }
        } catch (error) {
            console.error("Failed to retrieve sections from server:", error);
        } finally {
            setLoadingSections(false);
        }
    }, [tokenContext]);

    const location = useLocation();
    const appointmentData = location.state?.appointmentData;

    const {
        formState,
        fieldErrors,
        setFieldErrors,
        updateClinicType,
        clearFieldErrors,
        updateFieldErrors,
        updateFormState,
    } = useClinicFormState(appointmentData?.clinicType);

    useEffect(() => {
        retrieveSections(clinicID);
    }, [clinicID, retrieveSections]);

    // retrieving the patient form data from the approved appointment table component
    useEffect(() => {
        if (!appointmentData || !appointmentData.appointmentID || !appointmentData.type || !appointmentData.clinicType) {
            setOpenAppointmentDataNotFoundDialog(true);
            return;
        }

        updateFormState({
            firstName: appointmentData.firstName,
            lastName: appointmentData.lastName,
            email: appointmentData.email,
            phoneNumber: appointmentData.phoneNumber,
            appointmentDate: appointmentData.appointmentDate,
            preferredTime: appointmentData.preferredTime ? dayjs(appointmentData.preferredTime, "HH:mm") : null,
            appointmentID: appointmentData.appointmentID,
            clinic_name: appointmentData.clinic_name,
            type: appointmentData.type,
            clinicType: appointmentData.clinicType
        });

        updateClinicType(appointmentData.clinicType);
    }, [appointmentData, navigate, updateFormState, updateClinicType]);

    const handleCloseTheAppointmentDataNotFoundDialog = async () => {
        setOpenAppointmentDataNotFoundDialog(false);
        navigate("/doctor-portal/dashboard/ApprovedAppointments", {
            replace: true
        });
    }

    // function for handling the input during changing
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        updateFormState({
            [name]: type === "checkbox" ? (checked ? 1 : 0) : value
        });

        if (fieldErrors[name]) {
            clearFieldErrors({
                [name]: ""
            });
        }
    };

    // function for handling the appointment date change
    const handleAppointmentDateChange = useCallback((newValue) => {
        updateFormState({
            appointmentDate: newValue && dayjs(newValue) ? newValue : null
        });

        if (fieldErrors.appointmentDate) {
            clearFieldErrors({
                appointmentDate: null
            });
        }
    }, [fieldErrors, clearFieldErrors, updateFormState]);

    const handleCallBackTimePickerChange = useCallback((newValue) => {
        updateFormState({
            preferredTime: newValue && dayjs(newValue) ? newValue : null
        });
        if (fieldErrors.preferredTime) {
            clearFieldErrors({
                preferredTime: null
            });
        }
    }, [fieldErrors, clearFieldErrors, updateFormState]);

    // function to submit the consultation multi step form
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (![1, true].includes(formState?.consent)) {
                updateFieldErrors({
                    consent: "Consent is required. You must agree to the terms and privacy policy.."
                });
                return;
            }

            if (submitting) return; // Prevent multiple submissions
            setSubmitting(true);

            /**
             * checks a patient type condition either in clinic or patient side tables 
             */
            const endpoint = formState.type === "Patient" ? "/clinic-dashboard/consultPatient" : "/cms.api.com/clinic/dashboard/clinicConsultPatient";
            if (!endpoint) {
                console.error("Endpoint not found.");
                return;
            }

            const payload = {
                ...formState,
                type: formState.type,
                admin_id: user?.sid,
                clinic_name: formState.clinic_name,
                appointmentID: formState.appointmentID,
                clinic_appointment_id: formState.appointmentID
            }

            const clinic_type = encodeURIComponent(formState.clinicType);

            const response = await CMS.post(endpoint, payload, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                },
                params: {
                    clinicType: clinic_type
                }
            });

            if (response.status === 200) {
                setFieldErrors({});
                setOpenPatientConsultationSuccessfulDialog(true);
            }
        } catch (error) {
            if (error?.response?.status === 400) {
                setFieldErrors(error.response.data.errors);
            }
            console.error("Error in consultation form:", error);
        } finally {
            setSubmitting(false);
        }
    };

    /**
     * function to handle next steps in patient consultation based in clinic types
     */
    const handleNext = async () => {
        // Prevent handleNext from running on the last step
        if (activeStep === steps.length - 1) {
            return;
        }

        if (activeStep === 5) {
            if (![1, true, "Yes", "yes"].includes(formState?.consent)) {
                updateFieldErrors({
                    consent: "You must agree to the terms and privacy policy."
                });
                return; // Don't proceed to next step
            }
        }

        const clinicFieldGroups = {
            [CLINIC_TYPES.DENTAL]: {
                dynamicFieldNamesPhase_1: [
                    "allergiesDetails", "takingPrescriptionMedicationDetails", "chronicConditionDetails",
                    "surgeriesDetails", "jawPainDetails", "experiencedExcessiveBleedingDetails",
                    "heartProblemsDetails", "advisedTakingAntibioticsDetails"
                ],
                dynamicFieldNamesPhase_2: [
                    "smokeDetails", "consumeSugaryFoodsOrDrinksDetails", "dentalFlossDetails",
                    "consumeAlcoholDetails", "participateInSportsDetails", "balancedDietDetails",
                    "regularExerciseDetails", "eatingDisordersDetails"
                ],
                dynamicFieldNamesPhase_3: [
                    "experienceBleedingDetails", "toothSensitivityDetails", "dentalAppearanceDetails",
                    "looseTeethDetails", "badBreathOrBadTasteDetails", "dentalXraysDetails",
                    "dentalRestorationDetails", "orthodonticTreatmentDetails"
                ],
                dynamicFieldNamesPhase_4: [
                    "brushFrequencyDetails", "useMouthWashDetails", "replaceToothbrushDetails",
                    "cleanTongueDetails", "regularCheckupDetails", "dentalAnxietyDetails",
                    "dentalTraumaDetails"
                ],
            },
            [CLINIC_TYPES.PSYCHIATRY]: {
                dynamicFieldNamesPhase_1: [
                    "diagnosedMentalHealthConditionDetails", "takingPsychiatricMedicationDetails",
                    "hospitalizedForMentalHealthReasonDetails", "familyHistoryOfMentalHealthConditionsDetails",
                    "suicidalThoughtsOrBehaviorsDetails", "selfHarmOrSuicideDetails", "counselingOrTherapyDetails",
                    "emotionalOrBehavioralPatternsDetails"
                ],
                dynamicFieldNamesPhase_2: [
                    "moodDetails", "excessiveWorryOrAnxietyDetails", "sleepPatternsDetails", "appetiteOrWeightDetails",
                    "sleepChangesDetails", "hopelessnessOrWorthlessnessDetails", "agitationOrImpulsivityDetails",
                    "difficultyConcentratingDetails"
                ],
                dynamicFieldNamesPhase_3: [
                    "stressLevelsDetails", "supportSystemDetails", "majorLifeChangesDetails", "substancesDetails",
                    "sleepHoursDetails", "socialGroupsDetails", "livingSituationDetails", "copingWithStressDetails"
                ],
                dynamicFieldNamesPhase_4: [
                    "mentalHealthTreatmentDetails", "treatmentHistoryDetails", "currentlyInTherapyDetails",
                    "negativeExperienceWithMentalHealthTreatmentDetails", "currentlyUnderCareOfPsychiatristDetails",
                    "stoppedTakingPsychiatricMedicationsDetails", "sideEffectsFromPsychiatricMedicationsDetails",
                    "consistentWithAttendingTherapyOrTakingMedicationsDetails"
                ],
            }
        }

        const currentClinicFields = clinicFieldGroups[appointmentData.clinicType];

        // display the error message in the relevant field
        const stepFields = [
            ["firstName", "lastName", "email", "phoneNumber", "appointmentDate", "preferredTime"],
            ...(currentClinicFields.dynamicFieldNamesPhase_1.length > 0 ? [currentClinicFields.dynamicFieldNamesPhase_1] : []),
            ...(currentClinicFields.dynamicFieldNamesPhase_2.length > 0 ? [currentClinicFields.dynamicFieldNamesPhase_2] : []),
            ...(currentClinicFields.dynamicFieldNamesPhase_3.length > 0 ? [currentClinicFields.dynamicFieldNamesPhase_3] : []),
            ...(currentClinicFields.dynamicFieldNamesPhase_4.length > 0 ? [currentClinicFields.dynamicFieldNamesPhase_4] : []),
            ["consent"]
        ].filter(step => Array.isArray(step) && step.length > 0);

        if (submitting) return; // Prevent multiple submissions
        setSubmitting(true);

        const currentFields = stepFields[activeStep];
        const currentData = currentFields.reduce((data, field) => {
            data[field] = formState[field] || "";
            return data;
        }, {});

        try {
            const encodedClinicType = encodeURIComponent(appointmentData.clinicType);

            const response = await CMS.post(`/clinic-dashboard/validatePatientConsultation`, currentData, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                },
                params: {
                    step: activeStep,
                    clinicType: encodedClinicType
                }
            });

            if (response.status === 200) {
                const updated = { ...fieldErrors };
                currentFields.forEach((field) => {
                    if (field in updated) {
                        delete updated[field]
                    }
                });
                setFieldErrors(updated);

                setActiveStep((prev) => prev + 1);
            }
        } catch (error) {
            if (error?.response?.status === 400) {
                setFieldErrors(error.response.data.errors);
            } else {
                console.error("Validation step error in function handle next:", error);
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleBack = () => {
        clearFieldErrors();
        setActiveStep((prev) => prev - 1);
    };

    // components of consultation steps
    const renderStepContent = (step) => {
        if (step === 0) {
            return (
                <PatientInformationStepper
                    patientFormData={formState}
                    handleChange={handleChange}
                    fieldErrors={fieldErrors}
                    handleAppointmentDateChange={handleAppointmentDateChange}
                    handleCallBackTimePickerChange={handleCallBackTimePickerChange}
                />
            );
        } else if (step === 5) {
            return (
                <ConsentAndAgreementStepper
                    patientFormData={formState}
                    handleChange={handleChange}
                    fieldErrors={fieldErrors}
                />
            );
        } else {
            return (
                <DynamicSection
                    clinicType={appointmentData.clinicType}
                    clinicId={clinicID}
                    section={steps[step]}
                    fieldErrors={fieldErrors}
                    setFieldErrors={setFieldErrors}
                    formState={formState}
                    handleChange={handleChange}
                />
            );
        }
    };

    // function for closing the dialog box of patient consultation successful dialog
    const handleClosePatientConsultationSuccessfulDialog = async () => {
        if (formState.type === "Patient") {
            setOpenPatientConsultationSuccessfulDialog(false);
            navigate("/doctor-portal/dashboard/AppointmentHistory");
        } else if (formState.type === "Clinic") {
            setOpenPatientConsultationSuccessfulDialog(false);
            navigate("/doctor-portal/dashboard/ClinicAppointmentHistory");
        }
    }

    return (
        <div className="flex justify-center items-center min-h-[90vh] px-4 sm:px-6 lg:px-8">
            <div className="p-6 sm:p-8 lg:p-10 shadow-2xl rounded-3xl w-full max-w-[50vw] min-h-[50vh]">
                <div className="flex justify-center items-center mb-6 flex-col mx-auto py-10 px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-semibold text-center mb-6">
                        {appointmentData?.clinicType} - Patient Consultation Steps
                    </h2>
                    <Stepper activeStep={activeStep} className="mb-4 mt-4" alternativeLabel>
                        {loadingSections ? (
                            <div className="flex justify-center items-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-4 border-black/500"></div>
                            </div>
                        ) : (
                            steps.map((label) => (
                                <Step key={label}>
                                    <StepLabel>{label}</StepLabel>
                                </Step>
                            ))
                        )}
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
                                    {submitting ? "Loading..." : "Submit"}
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    color="primary"
                                    className="text-sm sm:text-base bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                                >
                                    {submitting ? "Loading..." : "Next"}
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
