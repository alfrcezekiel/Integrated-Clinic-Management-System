import {
    TextField,
    CircularProgress
} from "@mui/material";
import PropTypes from "prop-types";
import {
    useState,
    useEffect,
    useMemo
} from "react";
import CMS from "../../../API/CMS";
import { useAuthorization } from "../../../context/auth/useAuthorization";

const MedicalHistoryStepper = ({ patientFormData, handleChange, fieldErrors, setDynamicFieldNames }) => {
    const [medicalHistoryQuestions, setMedicalHistoryQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuthorization();

    const questionFieldNamesMemo = useMemo(() => {
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
        return questionFieldNames;
    }, [])

    const allowedFieldNamesMemo = useMemo(() => {
        const allowedFieldNames = [
            "allergiesDetails",
            "takingPrescriptionMedicationDetails",
            "chronicConditionDetails",
            "surgeriesDetails",
            "jawPainDetails",
            "experiencedExcessiveBleedingDetails",
            "heartProblemsDetails",
            "advisedTakingAntibioticsDetails"
        ]
        return allowedFieldNames;
    }, [])

    useEffect(() => {
        const clinicID = user?.sid;
        const tokenContext = token;

        if (!clinicID || !tokenContext) {
            console.error("Clinic ID or token is not available in the context or local storage.");
            setLoading(false);
        }
        
        const retrievedMedicalHistoryQuestions = async () => {
            try {
                const response = await CMS.get(`CMS/clinic-dashboard/retrievedMedicalHistoryConsultationQuestionnaires/${clinicID}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.consultationQuestionnaires;

                    // removed duplicate medical history consultation questions
                    const uniqueQuestionsMap = new Map();

                    data.forEach((q) => {
                        if (!uniqueQuestionsMap.has(q.question)) {
                            uniqueQuestionsMap.set(q.question, q);
                        }
                    })
                    const uniqueMedicalHistoryQuestions = Array.from(uniqueQuestionsMap.values());

                    setMedicalHistoryQuestions(uniqueMedicalHistoryQuestions)
                } else {
                    throw new Error(`Failed to retrieve medical history questionnaires ${response.status}`);
                }
            } catch (error) {
                console.error(`Failed to retrieved the medical history questions: ${error}`);
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 1000)
            }
        }

        if (clinicID) {
            retrievedMedicalHistoryQuestions()
        }
    }, [token, user?.sid]);

    useEffect(() => {
        if (!loading && medicalHistoryQuestions.length > 0) {
            const fieldNames = medicalHistoryQuestions
                .map((question) => {
                    const matchedEntry = Object.entries(questionFieldNamesMemo).find(
                        ([, questionText]) => questionText === question.question,
                    );
                    return matchedEntry ? matchedEntry[0] : `question_${question.id}`;
                })
                .filter((medicalHistoryFieldNames) => allowedFieldNamesMemo.includes(medicalHistoryFieldNames));
            setDynamicFieldNames(fieldNames);
        }
    }, [loading, medicalHistoryQuestions, questionFieldNamesMemo, setDynamicFieldNames, allowedFieldNamesMemo]);

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
                {medicalHistoryQuestions
                    .filter((question) => {
                        const matchedEntries = Object.entries(questionFieldNamesMemo).find(
                            ([, questionText]) => questionText === question.question
                        )
                        return matchedEntries && allowedFieldNamesMemo.includes(matchedEntries[0]);
                    })
                    .map((question, i) => {
                        const consultationQuestion = question.question

                        const matchedEntry = Object.entries(questionFieldNamesMemo).find(
                            ([, questionText]) => questionText === consultationQuestion
                        )

                        const fieldName = matchedEntry ? matchedEntry[0] : `question_${question.id}`

                        return (
                            <div className="flex flex-col w-full space-y-1 justify-between" key={i}>
                                <label className="text-sm text-gray-700 font-medium mb-1">
                                    {consultationQuestion}
                                </label>
                                <TextField
                                    name={fieldName}
                                    label={`Question ${i + 1}`}
                                    placeholder={`Enter Details`}
                                    value={patientFormData[fieldName] || ""}
                                    onChange={handleChange}
                                    error={!!fieldErrors[fieldName]}
                                    helperText={fieldErrors[fieldName] || ""}
                                    fullWidth
                                    className="w-full"
                                    margin="dense"
                                    autoComplete="off"
                                />
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

MedicalHistoryStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    setDynamicFieldNames: PropTypes.func.isRequired
};

export default MedicalHistoryStepper;
