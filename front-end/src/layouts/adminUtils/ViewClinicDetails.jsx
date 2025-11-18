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
    const [submitting, setSubmitting] = useState(false);
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

    // Questionnaires for different clinic types
    const clinicQuestionnaires = {
        "Dental Clinic": {
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
        },
        "Psychiatry Clinic": {
            "Mental Health History": [
                "Have you ever been diagnosed with a mental health condition?",
                "Are you currently taking any psychiatric medications?",
                "Have you ever been hospitalized for mental health reasons?",
                "Do you have a family history of mental health conditions?",
                "Have you ever experienced suicidal thoughts or behaviors?",
                "Have you ever attempted self-harm or suicide?",
                "Have you ever received counseling or therapy in the past?",
                "Have you noticed recurring emotional or behavioral patterns since childhood or adolescence?"
            ],
            "Current Symptoms": [
                "How would you describe your current mood (e.g., sad, anxious, irritable, elevated)?",
                "Do you experience excessive worry or anxiety?",
                "Have you noticed changes in your sleep patterns?",
                "Have you experienced changes in your appetite or weight?",
                "Have you experienced changes in your sleep (difficulty falling asleep, staying asleep, or oversleeping)?",
                "Do you have frequent thoughts of hopelessness or worthlessness?",
                "Have you noticed increased agitation, impulsivity, or risky behavior?",
                "Do you have difficulty concentrating or making decisions?"
            ],
            "Lifestyle Factors": [
                "How would you rate your stress levels?",
                "Do you have a support system (family/friends)?",
                "Have you experienced any major life changes recently?",
                "Do you use any substances (alcohol, drugs)?",
                "How many hours of sleep do you get on average per night?",
                "How often do you spend time with friends, family, or social groups?",
                "How would you describe your current living situation (supportive, stressful, isolated)?",
                "How do you usually cope with stress (e.g., talking, hobbies, avoidance, substances)?"
            ],
            "Treatment History": [
                "Have you received mental health treatment before?",
                "What treatments have you found helpful in the past?",
                "Are you currently in therapy?",
                "Have you ever had a negative experience with mental health treatment?",
                "Are you currently under the care of a psychiatrist, psychologist, or therapist?",
                "Have you ever stopped taking psychiatric medications without consulting your doctor?",
                "Have you experienced side effects from any psychiatric medications?",
                "How consistent have you been with attending therapy or taking medications?"
            ]
        },
        "Dermatology Clinic": {
            "Skin History": [
                "Have you ever been diagnosed with any skin conditions (e.g., eczema, psoriasis, acne, rosacea)?",
                "Have you had any skin cancer screenings?",
                "Do you have any allergies to skin care products?",
                "Have you had any previous skin treatments or procedures?",
                "Have you ever had a skin biopsy or other dermatologic procedures?",
                "Have you noticed any recurring or seasonal skin problems?",
                "When did you first notice issues with your skin?",
                "Do you have sensitive skin or experience irritation easily?"
            ],
            "Current Concerns": [
                "What is your primary skin concern?",
                "How long have you been experiencing this issue?",
                "Have you tried any treatments for this condition?",
                "Does your condition worsen with sun exposure?",
                "Is the area itchy, painful, scaly, or bleeding?",
                "Has your condition worsened, improved, or stayed the same recently?",
                "Are you experiencing hair loss or changes in hair density?",
                "Have you had any itching or irritation of the scalp?"
            ],
            "Skin Care Routine": [
                "What is your current skin care routine?",
                "Do you use sunscreen daily?",
                "What skin care products do you currently use?",
                "Have you recently changed any skin care products?",
                "What type of cleanser or soap do you currently use?",
                "Do you use any moisturizers? If yes, what brand or type?",
                "Do you remove your makeup before sleeping?",
                "Do you use any acne, anti-aging, or whitening products?"
            ],
            "Medical History": [
                "Do you have any chronic illnesses (e.g., diabetes, thyroid disorder, liver disease)?",
                "Are you currently taking any prescription or over-the-counter medications?",
                "Have you had any recent illnesses?",
                "Have you experienced recent changes in weight or appetite?",
                "Do you have a family history of skin cancer?",
                "Have you been under unusual stress recently?",
                "Do you have any known allergies (drug, food, environmental)?",
                "Are you currently pregnant, breastfeeding, or planning pregnancy?"
            ]
        },
        "Optometry Clinic": {
            "Vision History": [
                "When was your last eye exam?",
                "Do you currently wear glasses or contact lenses?",
                "Do you have a family history of eye diseases?",
                "Do you have any history of eye conditions like dry eyes, cataracts, glaucoma, or a retinal detachment?",
                "Have you ever undergone any eye surgeries (e.g., LASIK, cataract removal)?",
                "Do you experience eye strain when reading or using digital devices?",
                "Have you noticed any sudden changes in your vision recently?",
                "Do you have difficulty seeing at night or in low-light conditions?"
            ],
            "Current Symptoms": [
                "Do you experience frequent headaches?",
                "Do you have difficulty seeing at night?",
                "Do you experience eye strain or fatigue?",
                "Do you see floaters or flashes of light?",
                "Is your vision blurry at a distance, up close, or both?",
                "Do you experience halos or glare around lights?",
                "Are your eyes red or irritated frequently?",
                "Are you sensitive to light (photophobia)?",
            ],
            "Lifestyle Factors": [
                "How many hours per day do you spend on digital devices?",
                "Do you wear sunglasses outdoors?",
                "Do you work in an environment that strains your eyes?",
                "Do you participate in sports or activities that could affect your eyes?",
                "Do you take regular breaks from screen time?",
                "Do you wear sunglasses or UV-protective eyewear when outdoors?",
                "Do you drive frequently, especially at night?",
                "How many hours of sleep do you get on average each night?"
            ],
            "Medical History": [
                "Do you have diabetes or high blood pressure?",
                "Are you taking any medications that affect your eyes?",
                "Have you been diagnosed with any eye conditions?",
                "Do you have any allergies that affect your eyes?",
                "Which eye is affected (right, left, or both)?",
                "Do you have a history of cardiovascular disease?",
                "Do you have a history of migraines or severe headaches?",
                "Have you ever been diagnosed with autoimmune diseases (e.g., lupus, rheumatoid arthritis)?"
            ]
        },
        // Default questionnaire for other clinic types
        "default": {
            "Medical History": [
                "Do you have any allergies to medications?",
                "Are you currently taking any prescription medications?",
                "Do you have any chronic medical conditions?",
                "Have you had any recent surgeries or hospitalizations?"
            ],
            "Current Symptoms": [
                "What symptoms are you currently experiencing?",
                "When did these symptoms first appear?",
                "Have these symptoms changed over time?",
                "What makes your symptoms better or worse?"
            ],
            "Lifestyle Information": [
                "Do you smoke or use tobacco products?",
                "How often do you consume alcohol?",
                "Do you exercise regularly?",
                "How would you describe your diet?"
            ],
            "Family History": [
                "Is there a family history of this condition?",
                "What medical conditions run in your family?",
                "Are there any hereditary conditions in your family?",
                "Have any family members had similar symptoms?"
            ]
        }
    };

    // Get the appropriate questionnaire based on clinic type
    const getQuestionnaire = () => {
        if (!clinic?.clinic_type) return clinicQuestionnaires["default"];
        return clinicQuestionnaires[clinic.clinic_type] || clinicQuestionnaires["default"];
    };

    const currentQuestionnaire = getQuestionnaire();

    // function for handling the changes of the questionnaire 
    const handleQuestionnaireChange = (section, question, value) => {
        setQuestionnaire(prev => ({
            ...prev,
            [section]: {
                ...(prev[section] || {}),
                [question]: value
            }
        }));

        // Clear any previous errors for this field
        const fieldId = `${section}_${question}`.replace(/\s+/g, '_');
        setFieldErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[fieldId];
            return newErrors;
        });
    }

    // function for handling the submission of consultation questionnaire in admin side
    const handleConsultationQuestionnaireSubmit = async (e) => {
        const questionKeys = []
        try {
            e.preventDefault();
            if (submitting) return;
            setSubmitting(true);

            if (!admin_id || !tokenContext) {
                console.error("Admin ID or token is not available in context or local storage.");
                return;
            }

            const sectionNames = Object.keys(currentQuestionnaire);

            const responses = []

            sectionNames.forEach((section) => {
                currentQuestionnaire[section].forEach((question) => {
                    const answer = questionnaire[section]?.[question] || "";
                    const fieldId = `${section}_${question}`.replace(/\s+/g, '_');

                    questionKeys.push(fieldId);

                    responses.push({
                        clinic_id: clinic.clinic_id,
                        clinic_name: clinic.clinic_name,
                        clinic_type: clinic.clinic_type,
                        section: section,
                        question: question,
                        answer: answer,
                        adminID: admin_id
                    });
                });
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
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="p-8 rounded-2xl m-4">
            {clinic && clinic.clinic_type && (
                <div className="max-w-7xl mx-auto p-6 bg-white rounded-4xl shadow-2xl">
                    <h2 className="text-2xl font-bold text-black mb-6 text-center">
                        {clinic.clinic_type} - Patient Consultation Questionnaire
                    </h2>

                    <form className="space-y-10" id="consultation-questionnaire" onSubmit={handleConsultationQuestionnaireSubmit}>
                        {Object.entries(currentQuestionnaire).map(([section, questions], secIndex) => (
                            <div key={secIndex}>
                                <h3 className="text-xl font-semibold text-gray-800 mb-4 pb-2">
                                    {section}
                                </h3>
                                <div className="space-y-6">
                                    {questions.map((question, qIndex) => {
                                        const key = `${section}_${question}`.replace(/\s+/g, '_');
                                        return (
                                            <div key={qIndex} className="pb-4">
                                                <p className="text-gray-700 font-medium mb-2">
                                                    {secIndex + 1}.{qIndex + 1} {question}
                                                </p>
                                                <div className="flex space-x-6">
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={key}
                                                            value="Yes"
                                                            className="text-blue-600 focus:ring-blue-500 cursor-pointer"
                                                            checked={questionnaire[section]?.[question] === "Yes"}
                                                            onChange={() => handleQuestionnaireChange(section, question, "Yes")}
                                                        />
                                                        <span className="text-gray-700"> Yes</span>
                                                    </label>
                                                    <label className="flex items-center space-x-2 cursor-pointer">
                                                        <input
                                                            type="radio"
                                                            name={key}
                                                            value="No"
                                                            className="text-red-600 focus:ring-red-500 cursor-pointer"
                                                            checked={questionnaire[section]?.[question] === "No"}
                                                            onChange={() => handleQuestionnaireChange(section, question, "No")}
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
                                {submitting ? "Loading..." : "Submit Questionnaire"}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    )
}

export default ViewClinicDetails;