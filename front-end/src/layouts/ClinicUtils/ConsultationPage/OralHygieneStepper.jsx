import PropTypes from "prop-types";
import {
    useState,
    useEffect,
    useMemo
} from "react";
import CMS from "../../../API/CMS";
import {
    TextField,
    CircularProgress
} from "@mui/material";
import { useAuthorization } from "../../../context/auth/useAuthorization";

const OralHygieneStepper = ({ patientFormData, handleChange, fieldErrors, setDynamicOralHygieneFieldNames }) => {
    const [oralHygieneQuestionnaire, setOralHygieneQuestionnaire] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user, token } = useAuthorization();
    const clinicID = user?.sid;
    const tokenContext = token;

    const oralHygieneQuestionnaireMemo = useMemo(() => {
        return {
            brushFrequencyDetails: "How often do you brush your teeth each day?",
            useMouthWashDetails: "Do you use mouthwash regularly?",
            replaceToothbrushDetails: "Do you replace your toothbrush every 3-4 months?",
            cleanTongueDetails: "Do you clean your tongue as part of your oral hygiene routine?",
            regularCheckupDetails: "Do you have a regular dental check-up schedule?",
            dentalAnxietyDetails: "Do you have any dental anxiety or phobia?",
            dentalTraumaDetails: "Do you have a history of dental trauma or injuries?"
        }
    }, []);

    const oralHygieneFieldNamesMemo = useMemo(() => {
        return [
            "brushFrequencyDetails",
            "useMouthWashDetails",
            "replaceToothbrushDetails",
            "cleanTongueDetails",
            "regularCheckupDetails",
            "dentalAnxietyDetails",
            "dentalTraumaDetails"
        ]
    }, []);

    useEffect(() => {
        const retrieveOralHygieneQuestionnaire = async () => {
            try {
                if (!clinicID || !tokenContext) {
                    console.error("Clinic ID or token is not available in the context or local storage.");
                    setLoading(false);
                }   
                
                const response = await CMS.get(`CMS/clinic-dashboard/retrieveOralHygieneConsultationQuestionnaires/${clinicID}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${tokenContext}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.oralHygieneQuestionnaires;

                    const uniqueOralHygieneQuestionnaireMap = new Map();

                    data.forEach((question) => {
                        if (!uniqueOralHygieneQuestionnaireMap.has(question.question)) {
                            uniqueOralHygieneQuestionnaireMap.set(question.question, question);
                        }
                    })

                    const uniqueOralHygieneQuestionnaire = Array.from(uniqueOralHygieneQuestionnaireMap.values());

                    setOralHygieneQuestionnaire(uniqueOralHygieneQuestionnaire);
                } else {
                    throw new Error(`Failed to retrieve oral hygiene questionnaire: ${response.statusText}`);
                }
            } catch (error) {
                console.error(`Error in retrieving oral hygiene questionnaire component: ${error.message}`);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        }

        if (clinicID) {
            retrieveOralHygieneQuestionnaire();
        }
    }, [tokenContext, clinicID]);

    useEffect(() => {
        const dynamicOralHygieneFieldNames = async () => {
            if (!loading && oralHygieneQuestionnaire.length > 0) {
                const oralHygieneFieldNames = oralHygieneQuestionnaire
                    .map((question) => {
                        const oralHygieneQuestion = question.question;
                        const matchedEntry = Object.entries(oralHygieneQuestionnaireMemo).find(
                            ([, questionText]) => questionText === oralHygieneQuestion
                        );
                        return matchedEntry ? matchedEntry[0] : `question ${oralHygieneQuestionnaire.indexOf(question) + 1}`;
                    })
                    .filter((oralHygieneFieldNames) => oralHygieneFieldNamesMemo.includes(oralHygieneFieldNames));
                setDynamicOralHygieneFieldNames(oralHygieneFieldNames);
            }
        }
        dynamicOralHygieneFieldNames();
    }, [loading, oralHygieneQuestionnaire, oralHygieneQuestionnaireMemo, oralHygieneFieldNamesMemo, setDynamicOralHygieneFieldNames]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full flex-col mt-4">
                <CircularProgress />
                <p>Loading</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {oralHygieneQuestionnaire
                    .filter((oralHygieneQuestion) => {
                        const oralHygieneQuestions = oralHygieneQuestion.question;

                        const matchedEntry = Object.entries(oralHygieneQuestionnaireMemo).find(
                            ([, questionText]) => questionText === oralHygieneQuestions
                        );

                        return matchedEntry && oralHygieneFieldNamesMemo.includes(matchedEntry[0]);
                    })
                    .map((question, i) => {
                        const oralHygieneQuestions = question.question;

                        const matchedEntry = Object.entries(oralHygieneQuestionnaireMemo).find(
                            ([, questionText]) => questionText === oralHygieneQuestions
                        )

                        const oralHygieneFieldName = matchedEntry ? matchedEntry[0] : `question ${question.id}`;

                        return (
                            <div key={i} className="flex flex-col w-full space-y-1 justify-between">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    {oralHygieneQuestions}
                                </label>
                                <TextField
                                    label={`Question ${i + 1}`}
                                    placeholder="Enter Details"
                                    name={oralHygieneFieldName}
                                    value={patientFormData[oralHygieneFieldName] || ""}
                                    onChange={handleChange}
                                    autoComplete="off"
                                    type="text"
                                    error={!!fieldErrors[oralHygieneFieldName]}
                                    helperText={fieldErrors[oralHygieneFieldName] || ""}
                                    fullWidth
                                />
                            </div>
                        )
                    })}
            </div>
        </div>
    )
}

OralHygieneStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    setDynamicOralHygieneFieldNames: PropTypes.func.isRequired
}

export default OralHygieneStepper;