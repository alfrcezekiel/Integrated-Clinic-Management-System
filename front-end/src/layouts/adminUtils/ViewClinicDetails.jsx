import {
    useEffect,
    useState
} from 'react';
import {
    useNavigate,
    useLocation
} from 'react-router-dom';
import CMS from "../../API/CMS";
import { useAuthorization } from '../../context/auth/useAuthorization.jsx';

const ViewClinicDetails = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const clinicData = location.state?.clinic;
    const [clinic, setClinic] = useState(clinicData);
    const [questionnaire, setQuestionnaire] = useState({});
    const [fieldErrors, setFieldErrors] = useState({});
    const { token, user } = useAuthorization();

    const tokenContext = token;
    const admin_id = user?.sid;

    const navigateToAddClinicPage = async () => {
        navigate(`/admin-dashboard/AddClinic`)
    }

    useEffect(() => {
        if (!clinicData) {
            alert("No clinic data found. Redirecting to Add Clinic page.");
            navigate(`/admin-dashboard/AddClinic`)
            return;
        }
        setClinic(clinicData);
    }, [clinicData, navigate])

    // a consultation questionnaire for the dental clinic
    const dentalQuestionnaire = {
        "Medical History": [
            "Do you have any allergies (e.g., latex, medications)?",
            "Are you currently taking any prescription medications?",
            "Do you have any chronic conditions (e.g., diabetes, heart disease)?",
            "Have you had any surgeries or hospital stays in the past 5 years?",
            "Do you have a history of jaw pain or temporomandibular joint (TMJ) disorders?",
            "Have you ever experienced excessive bleeding after dental procedures?",
            "Do you have a history of heart problems or heart valve issues?",
            "Have you ever been advised to take antibiotics before dental procedures?"
        ],
        "Lifestyle Information": [
            "Do you smoke cigarettes, vape, or use tobacco products?",
            "Do you frequently consume sugary foods or beverages?",
            "Do you use dental floss regularly?",
            "Do you consume alcohol regularly?",
            "Do you participate in contact sports without a mouthguard?",
            "Do you have a balanced diet rich in fruits and vegetables?",
            "Do you have a regular exercise routine?",
            "Do you have a history of eating disorders?",
        ],
        "Clinical Assessments": [
            "Do you experience bleeding when brushing or flossing?",
            "Have you noticed any tooth sensitivity or pain recently?",
            "Are you satisfied with your dental appearance?",
            "Have you noticed any loose teeth or changes in your bite?",
            "Do you have persistent bad breath or a bad taste in your mouth?",
            "Have you had any dental X-rays in the past year?",
            "Do you have any dental restorations (fillings, crowns, etc.)?",
            "Have you had any orthodontic treatment (braces, aligners)?",
        ],
        "Oral Hygiene Habits": [
            "How often do you brush your teeth each day?",
            "Do you use mouthwash regularly?",
            "Do you replace your toothbrush every 3-4 months?",
            "Do you clean your tongue as part of your oral hygiene routine?",
            "Do you have a regular dental check-up schedule?",
            "Do you have any dental anxiety or phobia?",
            "Do you have a history of dental trauma or injuries?",
        ]
    };

    // function for handling the changes of the questionnaire 
    const handleQuestionnaireChange = async (key, value) => {
        setQuestionnaire((prevQuestionnaire) => ({
            ...prevQuestionnaire,
            [key]: value,
        }))

        setFieldErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors }
            delete updatedErrors[key]
            return updatedErrors
        });
    }

    // function for handling the submission of consultation questionnaire in admin side
    const handleConsultationQuestionnaireSubmit = async (e) => {
        const questionKeys = []
        try {
            e.preventDefault();
            if(!admin_id || !tokenContext){
                console.error("Admin ID or token is not available in context or local storage.");
                return;
            }
            console.log(`Admin ID: ${admin_id}, Token: ${tokenContext}`);
            const sectionNames = Object.keys(dentalQuestionnaire);

            const responses = []

            sectionNames.forEach((section, secIndex) => {
                dentalQuestionnaire[section].forEach((question, qIndex) => {
                    const key = `question-${secIndex}-${qIndex}`;
                    const answer = questionnaire[key] ?? "";

                    questionKeys.push(key);

                    responses.push({
                        clinic_id: clinic.clinic_id,
                        clinic_name: clinic.clinic_name,
                        clinic_type: clinic.clinic_type,
                        section: section,
                        question: question,
                        answer: answer,
                        adminID: admin_id
                    })
                })
            })

            const response = await CMS.post(`/admin-dashboard/submittedConsultationQuestionnaire`, { responses }, {
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${tokenContext}`
                }
            })

            if (response.status === 200) {
                alert("Questionnaire submitted successfully!");
                setQuestionnaire({});
                setFieldErrors({});
                navigateToAddClinicPage();
            } else {
                throw new Error(`Failed to submit questionnaire: ${response.statusText}`);
            }
        } catch (error) {
            if (error.response?.data?.errors || error.response?.data?.status === 400) {
                const errors = error.response.data.errors;
                const newFieldErrors = {};

                Object.entries(errors).forEach(([key, value]) => {
                    const match = key.match(/responses\[(\d+)\]\.answer/);

                    if (match) {
                        const index = parseInt(match[1])
                        const questionKey = questionKeys[index];

                        if (questionKey) {
                            newFieldErrors[questionKey] = value
                        }
                    }
                })
                setFieldErrors(newFieldErrors);
            } else {
                console.error(`Error in submitting the consultation questionnaires in handleConsultationQuestionnaireSubmit: ${error}`);
            }
        }
    }

    return (
        <div className="p-8 rounded-2xl m-4">
            {clinic && clinic.clinic_type === "Dental Clinic" && (
                <div className="max-w-7xl mx-auto p-6 bg-white rounded-4xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-black mb-6 text-center">
                        Dental Clinic - Patient Consultation Questionnaire
                    </h2>

                    <form className="space-y-10" id="consultation-questionnaire" onSubmit={handleConsultationQuestionnaireSubmit}>
                        {Object.entries(dentalQuestionnaire).map(([section, questions], secIndex) => (
                            <div key={secIndex}>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2">
                                    {section}
                                </h3>
                                <div className="space-y-6">
                                    {questions.map((question, qIndex) => {
                                        const key = `question-${secIndex}-${qIndex}`;
                                        return (
                                            <div key={qIndex} className="pb-4">
                                                <p className="text-gray-700 font-medium mb-2">
                                                    {secIndex + 1}.{qIndex + 1} {question}
                                                </p>
                                                <div className="flex space-x-6">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`question-${secIndex}-${qIndex}`}
                                                            value="Yes"
                                                            className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                            checked={questionnaire[`question-${secIndex}-${qIndex}`] === "Yes"}
                                                            onChange={() => handleQuestionnaireChange(`question-${secIndex}-${qIndex}`, `Yes`)}
                                                        />
                                                        <span className="text-gray-700"> Yes</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={`question-${secIndex}-${qIndex}`}
                                                            value="No"
                                                            className="text-red-600 focus:ring-red-500 cursor-pointer"
                                                            checked={questionnaire[`question-${secIndex}-${qIndex}`] === "No"}
                                                            onChange={() => handleQuestionnaireChange(`question-${secIndex}-${qIndex}`, `No`)}
                                                        />
                                                        <span className="text-gray-700"> No</span>
                                                    </label>
                                                </div>
                                                {fieldErrors[key] && typeof fieldErrors[key] === "string" && (
                                                    <p className="text-red-500 text-sm mt-2">
                                                        {fieldErrors[key]}
                                                    </p>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-center mt-8">
                            <button
                                type="submit"
                                className="bg-blue-600 text-white px-6 py-2 rounded-3xl shadow-md hover:bg-blue-700 transition duration-200 cursor-pointer"
                            >
                                Submit Questionnaire
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default ViewClinicDetails;