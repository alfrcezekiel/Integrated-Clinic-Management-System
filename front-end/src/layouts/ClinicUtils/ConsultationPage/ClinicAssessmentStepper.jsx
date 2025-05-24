import {
    TextField,
    FormControl,
    FormLabel,
    CircularProgress
} from "@mui/material";
import PropTypes from "prop-types";
import {
    useState,
    useMemo,
    useEffect
} from "react";
import CMS from "../../../API/CMS";

const ClinicAssessmentStepper = ({ patientFormData, handleChange, fieldErrors, setDynamicClinicalAssessmentFieldNames }) => {
    const [loading, setLoading] = useState(true);
    const [clinicalAssessmentQuestionnaire, setClinicalAssessmentQuestionnaire] = useState([]);

    const clinicalAssessmentQuestionnaireMemo = useMemo(() => {
        const clinicalAssessmentQuestionnaire = {
            experienceBleedingDetails: "Do you experience bleeding when brushing or flossing?",
            toothSensitivityDetails: "Have you noticed any tooth sensitivity or pain recently?",
            dentalAppearanceDetails: "Are you satisfied with your dental appearance?",
            looseTeethDetails: "Have you noticed any loose teeth or changes in your bite?",
            badBreathOrBadTasteDetails: "Do you have persistent bad breath or a bad taste in your mouth?",
            dentalXraysDetails: "Have you had any dental X-rays in the past year?",
            dentalRestorationDetails: "Do you have any dental restorations (fillings, crowns, etc.)?",
            orthodonticTreatmentDetails: "Have you had any orthodontic treatment (braces, aligners)?"
        }
        return clinicalAssessmentQuestionnaire
    }, [])

    const clinicalAssessmentFieldNamesMemo = useMemo(() => {
        const clinicalAssessmentFieldNames = [
            "experienceBleedingDetails",
            "toothSensitivityDetails",
            "dentalAppearanceDetails",
            "looseTeethDetails",
            "badBreathOrBadTasteDetails",
            "dentalXraysDetails",
            "dentalRestorationDetails",
            "orthodonticTreatmentDetails"
        ]
        return clinicalAssessmentFieldNames;
    }, [])

    useEffect(() => {
        const clinicID = localStorage.getItem("sid");
        const retrievedClinicalAssessmentQuestionnaire = async () => {
            try {
                if (!clinicID) {
                    throw new Error("Clinic ID is not available in local storage.");
                }

                const response = await CMS.get(`CMS/clinic-dashboard/retrieveClinicalAssessmentQuestionnaires/${clinicID}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.clinicalAssessmentQuestionnaires;

                    const uniqueClinicalAssessmentQuestionnaireMap = new Map();

                    data.forEach((q) => {
                        if(!uniqueClinicalAssessmentQuestionnaireMap.has(q.question)){
                            uniqueClinicalAssessmentQuestionnaireMap.set(q.question, q);
                        }
                    })

                    const uniqueClinicalAssessmentQuestionnaire = Array.from(uniqueClinicalAssessmentQuestionnaireMap.values());

                    setClinicalAssessmentQuestionnaire(uniqueClinicalAssessmentQuestionnaire)
                } else {
                    throw new Error(`Failed to retrieve clinical assessment questionnaire: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Error retrieving clincal assessment questionnaire function: ${error}`)
            } finally {
                setTimeout(() => {
                    setLoading(false)
                }, 1000)
            }
        }

        if (clinicID) {
            retrievedClinicalAssessmentQuestionnaire()
        }
    }, [])

    useEffect(() => {
        if(!loading && clinicalAssessmentQuestionnaire.length > 0){
            const clinicalAssesmentFieldNames = clinicalAssessmentQuestionnaire.map((question) => {
                const clinicalAssessmentQuestion = question.question

                const matchedEntry = Object.entries(clinicalAssessmentQuestionnaireMemo).find(
                    ([, questionText]) => questionText === clinicalAssessmentQuestion
                )
                
                return matchedEntry ? matchedEntry[0] : `question_${question.id}`;
            }).filter((clinicalAssessmentFieldNames) => clinicalAssessmentFieldNamesMemo.includes(clinicalAssessmentFieldNames))
            setDynamicClinicalAssessmentFieldNames(clinicalAssesmentFieldNames)
        }
    }, [clinicalAssessmentFieldNamesMemo, clinicalAssessmentQuestionnaireMemo, loading, setDynamicClinicalAssessmentFieldNames, clinicalAssessmentQuestionnaire])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full flex-col mt-4">
                <CircularProgress />
                <p>Loading</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {clinicalAssessmentQuestionnaire
                    .filter((clinicalAssessmentQuestion) => {
                        const matchedEntry = Object.entries(clinicalAssessmentQuestionnaireMemo).find(
                            ([, questionText]) => questionText === clinicalAssessmentQuestion.question
                        )

                        return matchedEntry && clinicalAssessmentFieldNamesMemo.includes(matchedEntry[0])
                    })
                    .map((question, i) => {
                        const clinicalAssessmentQuestion = question.question;

                        const matchedEntry = Object.entries(clinicalAssessmentQuestionnaireMemo).find(
                            ([, questionText]) => questionText === clinicalAssessmentQuestion
                        )

                        const fieldName = matchedEntry ? matchedEntry[0] : `question_${question.id}`;

                        return (
                            <FormControl className="w-full" key={i}>
                                <FormLabel className="mb-2 text-sm text-gray-700">
                                    {clinicalAssessmentQuestion}
                                </FormLabel>
                                <TextField
                                    label={`Question ${i + 1}`}
                                    name={fieldName}
                                    placeholder="Enter Details"
                                    fullWidth
                                    margin="dense"
                                    value={patientFormData[fieldName]}
                                    onChange={handleChange}
                                    error={!!fieldErrors[fieldName]}
                                    helperText={fieldErrors[fieldName] ? fieldErrors[fieldName] : ""}
                                    autoComplete="off"
                                />
                            </FormControl>
                        )
                    })}
            </div>
        </div>
    );
};

ClinicAssessmentStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    setDynamicClinicalAssessmentFieldNames: PropTypes.func.isRequired
};

export default ClinicAssessmentStepper;