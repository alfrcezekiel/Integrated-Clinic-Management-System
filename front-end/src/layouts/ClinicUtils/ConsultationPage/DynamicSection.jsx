import { useState, useEffect, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import CMS from '../../../API/CMS';
import { useAuthorization } from '../../../context/auth/useAuthorization';
import TextField from "@mui/material/TextField";

// Predefined field names from MedicalHistory component
const PREDEFINED_FIELDS = {
    'Medical History': [
        {
            fieldName: 'allergiesDetails',
            question: 'Do you have any allergies (e.g., latex, medications)?'
        },
        {
            fieldName: 'takingPrescriptionMedicationDetails',
            question: 'Are you currently taking any prescription medications?'
        },
        {
            fieldName: 'chronicConditionDetails',
            question: 'Do you have any chronic conditions (e.g., diabetes, heart disease)?'
        },
        {
            fieldName: 'surgeriesDetails',
            question: 'Have you had any surgeries or hospital stays in the past 5 years?'
        },
        {
            fieldName: 'jawPainDetails',
            question: 'Do you have a history of jaw pain or temporomandibular joint (TMJ) disorders?'
        },
        {
            fieldName: 'experiencedExcessiveBleedingDetails',
            question: 'Have you ever experienced excessive bleeding after dental procedures?'
        },
        {
            fieldName: 'heartProblemsDetails',
            question: 'Do you have a history of heart problems or heart valve issues?'
        },
        {
            fieldName: 'advisedTakingAntibioticsDetails',
            question: 'Have you ever been advised to take antibiotics before dental procedures?'
        }
    ],
    "Lifestyle Information": [
        {
            fieldName: "smokeDetails",
            question: "Do you smoke cigarettes, vape, or use tobacco products?",
        },
        {
            fieldName: "consumeSugaryFoodsOrDrinksDetails",
            question: "Do you frequently consume sugary foods or beverages?",
        },
        {
            fieldName: "dentalFlossDetails",
            question: "Do you use dental floss regularly?",
        },
        {
            fieldName: "consumeAlcoholDetails",
            question: "Do you consume alcohol regularly?",
        },
        {
            fieldName: "participateInSportsDetails",
            question: "Do you participate in contact sports without a mouthguard?",
        },
        {
            fieldName: "balancedDietDetails",
            question: "Do you have a balanced diet rich in fruits and vegetables?",
        },
        {
            fieldName: "regularExerciseDetails",
            question: "Do you have a regular exercise routine?",
        },
        {
            fieldName: "eatingDisordersDetails",
            question: "Do you have a history of eating disorders?",
        }
    ],
    "Clinical Assessments": [
        {
            fieldName: "experienceBleedingDetails",
            question: "Do you experience bleeding when brushing or flossing?",
        },
        {
            fieldName: "toothSensitivityDetails",
            question: "Have you noticed any tooth sensitivity or pain recently?",
        },
        {
            fieldName: "dentalAppearanceDetails",
            question: "Are you satisfied with your dental appearance?",
        },
        {
            fieldName: "looseTeethDetails",
            question: "Have you noticed any loose teeth or changes in your bite?",
        },
        {
            fieldName: "badBreathOrBadTasteDetails",
            question: "Do you have persistent bad breath or a bad taste in your mouth?",
        },
        {
            fieldName: "dentalXraysDetails",
            question: "Have you had any dental X-rays in the past year?",
        },
        {
            fieldName: "dentalRestorationDetails",
            question: "Do you have any dental restorations (fillings, crowns, etc.)?",
        },
        {
            fieldName: "orthodonticTreatmentDetails",
            question: "Have you had any orthodontic treatment (braces, aligners)?",
        }
    ],
    "Oral Hygiene Habits": [
        {
            fieldName: "brushFrequencyDetails",
            question: "How often do you brush your teeth each day?",
        },
        {
            fieldName: "useMouthWashDetails",
            question: "Do you use mouthwash regularly?",
        },
        {
            fieldName: "replaceToothbrushDetails",
            question: "Do you replace your toothbrush every 3-4 months?",
        },
        {
            fieldName: "cleanTongueDetails",
            question: "Do you clean your tongue as part of your oral hygiene routine?",
        },
        {
            fieldName: "regularCheckupDetails",
            question: "Do you have a regular dental check-up schedule?",
        },
        {
            fieldName: "dentalAnxietyDetails",
            question: "Do you have any dental anxiety or phobia?",
        },
        {
            fieldName: "dentalTraumaDetails",
            question: "Do you have a history of dental trauma or injuries?",
        }
    ],
    // Add more sections as needed
    "Mental Health History": [
        {
            fieldName: "diagnosedMentalHealthConditionDetails",
            question: "Have you been diagnosed with any mental health conditions?"
        },
        {
            fieldName: "takingPsychiatricMedicationDetails",
            question: "Are you currently taking any psychiatric medications?"
        },
        {
            fieldName: "hospitalizedForMentalHealthReasonDetails",
            question: "Have you been hospitalized for mental health reasons?"
        },
        {
            fieldName: "familyHistoryOfMentalHealthConditionsDetails",
            question: "Do you have a family history of mental health conditions?"
        },
        {
            fieldName: "suicidalThoughtsOrBehaviorsDetails",
            question: "Have you experienced suicidal thoughts or behaviors?"
        },
        {
            fieldName: "selfHarmOrSuicideDetails",
            question: "Have you engaged in self-harm or suicide attempts?"
        },
        {
            fieldName: "counselingOrTherapyDetails",
            question: "Have you received counseling or therapy for mental health issues?"
        },
        {
            fieldName: "emotionalOrBehavioralPatternsDetails",
            question: "Do you have any emotional or behavioral patterns that concern you?"
        }
    ],
    "Current Symptoms": [
        {
            fieldName: "moodDetails",
            question: "How would you describe your current mood (e.g., sad, anxious, irritable, elevated)?"
        },
        {
            fieldName: "excessiveWorryOrAnxietyDetails",
            question: "Do you experience excessive worry or anxiety?"
        },
        {
            fieldName: "sleepPatternsDetails",
            question: "Have you noticed changes in your sleep patterns?"
        },
        {
            fieldName: "appetiteOrWeightDetails",
            question: "Have you experienced changes in your appetite or weight?"
        },
        {
            fieldName: "sleepChangesDetails",
            question: "Have you experienced changes in your sleep (difficulty falling asleep, staying asleep, or oversleeping)?"
        },
        {
            fieldName: "hopelessnessOrWorthlessnessDetails",
            question: "Do you have frequent thoughts of hopelessness or worthlessness?"
        },
        {
            fieldName: "agitationOrImpulsivityDetails",
            question: "Have you noticed increased agitation, impulsivity, or risky behavior?"
        },
        {
            fieldName: "difficultyConcentratingDetails",
            question: "Do you have difficulty concentrating or making decisions?"
        }
    ],
    "Lifestyle Factors": [
        {
            fieldName: "stressLevelsDetails",
            question: "How would you rate your stress levels?"
        },
        {
            fieldName: "supportSystemDetails",
            question: "Do you have a support system (family/friends)?"
        },
        {
            fieldName: "majorLifeChangesDetails",
            question: "Have you experienced any major life changes recently?"
        },
        {
            fieldName: "substancesDetails",
            question: "Do you use any substances (alcohol, drugs)?"
        },
        {
            fieldName: "sleepHoursDetails",
            question: "How many hours of sleep do you get on average per night?"
        },
        {
            fieldName: "socialGroupsDetails",
            question: "How often do you spend time with friends, family, or social groups?"
        },
        {
            fieldName: "livingSituationDetails",
            question: "How would you describe your current living situation (supportive, stressful, isolated)?"
        },
        {
            fieldName: "copingWithStressDetails",
            question: "How do you usually cope with stress (e.g., talking, hobbies, avoidance, substances)?"
        }
    ],
    "Treatment History": [
        {
            fieldName: "mentalHealthTreatmentDetails",
            question: "Have you received mental health treatment before?"
        },
        {
            fieldName: "treatmentHistoryDetails",
            question: "What treatments have you found helpful in the past?"
        },
        {
            fieldName: "currentlyInTherapyDetails",
            question: "Are you currently in therapy?"
        },
        {
            fieldName: "negativeExperienceWithMentalHealthTreatmentDetails",
            question: "Have you ever had a negative experience with mental health treatment?"
        },
        {
            fieldName: "currentlyUnderCareOfPsychiatristDetails",
            question: "Are you currently under the care of a psychiatrist, psychologist, or therapist?"
        },
        {
            fieldName: "stoppedTakingPsychiatricMedicationsDetails",
            question: "Have you ever stopped taking psychiatric medications without consulting your doctor?"
        },
        {
            fieldName: "sideEffectsFromPsychiatricMedicationsDetails",
            question: "Have you experienced side effects from any psychiatric medications?"
        },
        {
            fieldName: "consistentWithAttendingTherapyOrTakingMedicationsDetails",
            question: "How consistent have you been with attending therapy or taking medications?"
        }
    ]
};

const DynamicSection = ({
    clinicType,
    clinicId,
    section,
    fieldErrors,
    formState,
    handleChange
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const { token } = useAuthorization();
    const tokenContext = token;
    const [questions, setQuestions] = useState([]);

    // Get the predefined fields for the current section
    const sectionFields = useMemo(() => {
        return PREDEFINED_FIELDS[section] || [];
    }, [section]);

    // Fetch questionnaire based on clinic type and section
    const fetchQuestionnaire = useCallback(async () => {
        try {
            setIsLoading(true);
            const response = await CMS.get(`/cms.api.com/clinic/consultation_questionnaire_questions`, {
                headers: {
                    "Authorization": `Bearer ${tokenContext}`
                },
                params: {
                    clinicID: clinicId,
                    section: section,
                    clinicType: clinicType
                }
            })

            if (response.status === 200) {
                const data = sectionFields.length > 0 ? sectionFields.map(field => field.question) : response.data.questions;

                const initialTouched = {};

                if (sectionFields.length > 0) {
                    sectionFields.forEach(q => {
                        initialTouched[q.fieldName] = ""
                    })
                } else {
                    data.forEach((_, index) => {
                        const fieldName = `question_${index}`;
                        initialTouched[fieldName] = ""
                    })
                }

                setQuestions(data);
            } else {
                throw new Error("Failed to fetch questionnaire")
            }
        } catch (error) {
            console.error('Error fetching questionnaire:', error);
            throw error;
        } finally {
            setIsLoading(false);
        }
    }, [clinicId, section, clinicType, tokenContext, sectionFields]);


    useEffect(() => {
        fetchQuestionnaire();
    }, [fetchQuestionnaire]);

    return (
        <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                    </div>
                ) : questions.map((question, index) => {
                    const field = sectionFields[index];
                    const fieldName = field ? field.fieldName : `question_${index}`;
                    const hasError = !!fieldErrors[fieldName];
                    const inputId = `question-${index}`;

                    return (
                        <div key={fieldName} className="space-y-1 flex flex-col h-fit">
                            <label
                                htmlFor={inputId}
                                className={`flex text-sm font-medium h-[50px] lg:h-[50px] max-lg:h-[70px] md:h-[110px] sm:h-[60px] max-sm:h-[70px] items-center leading-5 ${hasError ? 'text-red-600' : 'text-gray-700'
                                    }`}
                            >
                                <span className="leading-tight">{question}</span>
                                <span className="text-red-500 ml-1">*</span>
                            </label>

                            <TextField
                                placeholder="Enter your answer"
                                id={inputId}
                                name={fieldName}
                                value={formState[fieldName]}
                                onChange={handleChange}
                                variant="outlined"
                                autoComplete="off"
                                fullWidth
                                helperText={fieldErrors[fieldName]}
                                error={hasError}
                                className={`${hasError ? 'border-red-500' : 'border-gray-300'}`}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

DynamicSection.propTypes = {
    clinicType: PropTypes.string.isRequired,
    clinicId: PropTypes.string.isRequired,
    section: PropTypes.string.isRequired,
    fieldErrors: PropTypes.object.isRequired,
    formState: PropTypes.object.isRequired,
    handleChange: PropTypes.func.isRequired
};

export default DynamicSection;