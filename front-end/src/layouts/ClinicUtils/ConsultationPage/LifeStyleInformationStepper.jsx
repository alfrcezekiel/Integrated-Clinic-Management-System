import {
    TextField,
    FormControl,
    FormLabel,
    CircularProgress
} from "@mui/material";
import PropTypes from "prop-types";
import {
    useEffect,
    useState
} from "react";
import CMS from "../../../API/CMS";

const LifeStyleInformationStepper = ({ patientFormData, handleChange, fieldErrors }) => {
    const [lifestyleInformationQuestions, setLifestyleInformationQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

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

                    setLifestyleInformationQuestions(data);
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
        retrievedLifestleInformationQuestionnaire();
    }, []);

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
                {lifestyleInformationQuestions.map((question, i) => {
                    const lifestyleConsultationQuestion = question.question;

                    const matecheLifestyleInfoEntry = Object.entries(lifestyleInformationQuestionnaires).find(
                        ([, lifestyleQuestion]) => lifestyleQuestion === lifestyleConsultationQuestion
                    )

                    const fieldName = matecheLifestyleInfoEntry ? matecheLifestyleInfoEntry[0] : `question_${question.id}`;

                    console.log(fieldName)
                    return (
                        <>
                            <FormControl key={i} className="w-full">
                                <FormLabel className="mb-2 text-sm text-gray-700">
                                    {lifestyleConsultationQuestion}
                                </FormLabel>
                                <TextField
                                    name={fieldName}
                                    label={lifestyleConsultationQuestion}
                                    placeholder={`Enter ${lifestyleConsultationQuestion}`}
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
                        </>
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
};

export default LifeStyleInformationStepper;
