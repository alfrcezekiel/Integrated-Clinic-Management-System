import {
    TextField,
    FormControl,
    FormLabel,
    CircularProgress
} from "@mui/material";
import PropTypes from "prop-types";
import {
    useEffect,
    useState,
    useMemo
} from "react";
import CMS from "../../../API/CMS";

const LifeStyleInformationStepper = ({ patientFormData, handleChange, fieldErrors, setDynamicLifeStyleInformationFieldNames }) => {
    const [lifestyleInformationQuestions, setLifestyleInformationQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    const lifeStyleInformationQuestionsMemo = useMemo(() => {
        const lifestyleInformationQuestionnaires = {
            smokeDetails: "Do you smoke cigarettes, vape, or use tobacco products?",
            consumeSugaryFoodsOrDrinksDetails: "Do you frequently consume sugary foods or beverages?",
            dentalFlossDetails: "Do you use dental floss regularly?",
            consumeAlcoholDetails: "Do you consume alcohol regularly?",
            participateInSportsDetails: "Do you participate in contact sports without a mouthguard?",
            balancedDietDetails: "Do you have a balanced diet rich in fruits and vegetables?",
            regularExerciseDetails: "Do you have a regular exercise routine?",
            eatingDisordersDetails: "Do you have a history of eating disorders?",
        }
        return lifestyleInformationQuestionnaires;
    }, [])

    const lifeStyleInformationAllowedFieldNamesMemo = useMemo(() => {
        const lifeStyleInformationAllowedFieldNames = [
            "smokeDetails",
            "consumeSugaryFoodsOrDrinksDetails",
            "dentalFlossDetails",
            "consumeAlcoholDetails",
            "participateInSportsDetails",
            "balancedDietDetails",
            "regularExerciseDetails",
            "eatingDisordersDetails"
        ]
        return lifeStyleInformationAllowedFieldNames;
    }, [])

    useEffect(() => {
        const clinicID = localStorage.getItem("sid");
        const retrievedLifestleInformationQuestionnaire = async () => {
            try {
                if (!clinicID) {
                    throw new Error("Clinic ID is not available in local storage.");
                }

                const response = await CMS.get(`CMS/clinic-dashboard/retrieveLifestyleInformationQuestionnaires/${clinicID}`, {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("authToken")}`
                    }
                })

                if (response.status === 200) {
                    const data = response.data.lifestyleInformationQuestionnaires;

                    // removed duplicate lifestyle information consultation questionnaire 
                    const unqiueLifestyleInformationQuestionsToMapped = new Map();

                    data.forEach((q) => {
                        if (!unqiueLifestyleInformationQuestionsToMapped.has(q.question)) {
                            unqiueLifestyleInformationQuestionsToMapped.set(q.question, q);
                        }
                    })
                    const uniqueLifestyleInformationQuestions = Array.from(unqiueLifestyleInformationQuestionsToMapped.values());

                    setLifestyleInformationQuestions(uniqueLifestyleInformationQuestions);
                } else {
                    throw new Error(`Failed to retrieve lifestyle information questionnaires ${response.status}`);
                }
            } catch (error) {
                console.error(`Failed to retrieved the lifestyle information questions component: ${error}`);
            } finally {
                setTimeout(() => {
                    setLoading(false);
                }, 1000);
            }
        }

        if (clinicID) {
            retrievedLifestleInformationQuestionnaire();
        }
    }, []);

    useEffect(() => {
        if (!loading && lifestyleInformationQuestions.length > 0) {
            const lifestyleInfoFieldNames = lifestyleInformationQuestions.map((question) => {
                const lifestyleConsultationQuestion = question.question;

                const matecheLifestyleInfoEntry = Object.entries(lifeStyleInformationQuestionsMemo).find(
                    ([, lifestyleQuestion]) => lifestyleQuestion === lifestyleConsultationQuestion
                )

                const fieldName = matecheLifestyleInfoEntry ? matecheLifestyleInfoEntry[0] : `question_${question.id}`;
                return fieldName;
            }).filter((lifeStyleInformationFieldNames) => lifeStyleInformationAllowedFieldNamesMemo.includes(lifeStyleInformationFieldNames));

            setDynamicLifeStyleInformationFieldNames(lifestyleInfoFieldNames);
        }
    }, [lifeStyleInformationQuestionsMemo, loading, lifestyleInformationQuestions, setDynamicLifeStyleInformationFieldNames, lifeStyleInformationAllowedFieldNamesMemo])

    if (loading) {
        return (
            <div className="flex justify-center items-center flex-col h-full mt-4">
                <CircularProgress />
                <p>Loading</p>
            </div>
        )
    }

    return (
        <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {lifestyleInformationQuestions
                    .filter((lifeStyleInfoQuestions) => {
                        const matchedEntry = Object.entries(lifeStyleInformationQuestionsMemo).find(
                            ([, questionText]) => questionText === lifeStyleInfoQuestions.question
                        )

                        return matchedEntry && lifeStyleInformationAllowedFieldNamesMemo.includes(matchedEntry[0]);
                    })
                    .map((question, i) => {
                        const lifestyleConsultationQuestion = question.question;

                        const matecheLifestyleInfoEntry = Object.entries(lifeStyleInformationQuestionsMemo).find(
                            ([, lifestyleQuestion]) => lifestyleQuestion === lifestyleConsultationQuestion
                        )

                        const fieldName = matecheLifestyleInfoEntry ? matecheLifestyleInfoEntry[0] : `question_${question.id}`;
                        return (
                            <FormControl key={i} className="w-full">
                                <FormLabel className="mb-2 text-sm text-gray-700">
                                    {lifestyleConsultationQuestion}
                                </FormLabel>
                                <TextField
                                    name={fieldName}
                                    label={`Question ${i += 1}`}
                                    placeholder="Enter Details"
                                    type="text"
                                    margin="dense"
                                    value={patientFormData[fieldName]}
                                    onChange={handleChange}
                                    error={!!fieldErrors[fieldName]}
                                    helperText={fieldErrors[fieldName] ? fieldErrors[fieldName] : ""}
                                    fullWidth
                                    autoComplete="off"
                                />
                            </FormControl>
                        )
                    })}
            </div>
        </div>
    );
};

LifeStyleInformationStepper.propTypes = {
    patientFormData: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    setDynamicLifeStyleInformationFieldNames: PropTypes.func.isRequired
};

export default LifeStyleInformationStepper;
