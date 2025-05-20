import {
    TextField,
    FormControl,
    FormLabel,
    CircularProgress
} from "@mui/material";
import PropTypes from "prop-types";
import {
    useState,
    useEffect,
} from "react";
import CMS from "../../../API/CMS";

const MedicalHistoryStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    const [medicalHistoryQuestions, setMedicalHistoryQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const questionFieldNames = {
        allergiesDetails: "Do you have any allergies (e.g., latex, medications)?",
        takingPrescriptionMedicationDetails: "Are you currently taking any prescription medications?",
        chronicConditionDetails: "Do you have any chronic conditions (e.g., diabetes, heart disease)?",
        surgeriesDetails: "Have you had any surgeries or hospital stays in the past 5 years?",
        jawPainDetails: "Do you have a history of jaw pain or temporomandibular joint (TMJ) disorders?",
        experiencedExcessiveBleedingDetails: "Have you ever experienced excessive bleeding after dental procedures?",
        heartProblemsDetails: "Do you have a history of heart problems or heart valve issues?",
        advisedTakingAntibioticsDetails: "Have you ever been advised to take antibiotics before dental procedures?",
    }

    useEffect(() => {
        const clinicID = localStorage.getItem("sid")
        const retrievedMedicalHistoryQuestions = async () => {
            try {
                const response = await CMS.get(`CMS/clinic-dashboard/retrievedMedicalHistoryConsultationQuestionnaires/${clinicID}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.consultationQuestionnaires;

                    setMedicalHistoryQuestions(data)
                }
            } catch (error) {
                console.error(`Failed to retrieved the medical history questions: ${error}`);
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 1000)
            }
        }
        retrievedMedicalHistoryQuestions()
    }, []);

    if (loading) {
        return (
            <>
                <div className="flex justify-center items-center flex-col h-full mt-4">
                    <CircularProgress />
                    <p>Loading</p>
                </div>
            </>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {medicalHistoryQuestions.map((question, i) => {
                    const consultationQuestion = question.question

                    const matchedEntry = Object.entries(questionFieldNames).find(
                        ([, questionText]) => questionText === consultationQuestion
                    )

                    const fieldName = matchedEntry ? matchedEntry[0] : `question_${question.id}`

                    return (
                        <FormControl className="w-full" key={i}>
                            <FormLabel className="mb-2 text-sm text-gray-700">
                                {consultationQuestion}
                            </FormLabel>
                            <TextField
                                name={fieldName}
                                label={consultationQuestion}
                                placeholder={`Enter ${consultationQuestion}`}
                                value={patientFormData[fieldName]}
                                onChange={handleChange}
                                error={!!fieldErrors[fieldName]}
                                helperText={fieldErrors[fieldName]}
                                fullWidth
                                margin="dense"
                                autoComplete="off"
                            />
                        </FormControl>
                    )
                })}
            </div>
        </div>
    );
};

MedicalHistoryStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    setIncludedMedicalFields: PropTypes.func.isRequired,
};

export default MedicalHistoryStepper;
