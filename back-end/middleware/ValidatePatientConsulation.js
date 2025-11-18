import { StatusCodes } from "http-status-codes";
import { body, validationResult } from "express-validator";

// Step 1: Patient Information
const step1Validation = [
    body("firstName")
        .notEmpty()
        .withMessage("First name is required"),
    body("lastName")
        .notEmpty()
        .withMessage("Last name is required"),
    body("email")
        .notEmpty()
        .withMessage("Email is required")
        .isEmail()
        .withMessage("Invalid email address"),
    body("phoneNumber")
        .notEmpty()
        .withMessage("Phone Number is required")
        .isLength({ min: 11, max: 11 })
        .withMessage("Phone number should be 11 digits"),
    body("appointmentDate")
        .notEmpty()
        .withMessage("Appointment date is required"),
    body("preferredTime")
        .notEmpty()
        .withMessage("Appointment time is required"),
];

// Step 6: Consent and Agreement
const step6DynamicValidationClinicTypesFieldNames = async (clinicType) => {
    let possibleFields = {};
    
    if (clinicType === "Dental Clinic") {
        possibleFields = {
            consent: "Consent is required. You must agree to the terms and privacy policy."
        };
    } else if (clinicType === "Psychiatry Clinic") {
        possibleFields = {
            consent: "Consent is required. You must agree to the terms and privacy policy."
        };
    }

    return Object.entries(possibleFields).map(([field, message]) => {
        return body(field)
            .notEmpty()
            .withMessage(message)
    })
}

// dynamic medical history question based on the retrieved consultation questionnaire in the server
const step2DynamicValidationClinicTypesFieldNames = async (clinicType) => {
    let possibleFields = {};
    
    if (clinicType === "Dental Clinic") {
        possibleFields = {
            allergiesDetails: "Allergy details is required",
            takingPrescriptionMedicationDetails: "Prescription medication details is required",
            chronicConditionDetails: "Medical condition details are required",
            surgeriesDetails: "Surgeries details is required",
            jawPainDetails: "Jaw pain details are required",
            experiencedExcessiveBleedingDetails: "Experience excessive bleeding details are required",
            heartProblemsDetails: "Cardiovascular issues details are required",
            advisedTakingAntibioticsDetails: "Advised taking antibiotics details is required"
        };
    } else if (clinicType === "Psychiatry Clinic") {
        possibleFields = {
            diagnosedMentalHealthConditionDetails: "Mental health condition details are required",
            takingPsychiatricMedicationDetails: "Psychiatric medication details are required",
            hospitalizedForMentalHealthReasonDetails: "Hospitalization details are required",
            familyHistoryOfMentalHealthConditionsDetails: "Family mental health history details are required",
            suicidalThoughtsOrBehaviorsDetails: "Suicidal thoughts or behaviors details are required",
            selfHarmOrSuicideDetails: "Self-harm or suicide details are required",
            counselingOrTherapyDetails: "Counseling or therapy details are required",
            emotionalOrBehavioralPatternsDetails: "Emotional or behavioral patterns details are required"
        };
    }

    return Object.entries(possibleFields).map(([field, message]) => {
        return body(field)
            .notEmpty()
            .withMessage(message)
    })
}

const step3DynamicValidationClinicTypesFieldNames = async (clinicType) => {
    let possibleFields = {};
    
    if (clinicType === "Dental Clinic") {
        possibleFields = {
            smokeDetails: "Smoking details required",
            consumeSugaryFoodsOrDrinksDetails: "Sugary foods or drinks details is required",
            dentalFlossDetails: "Dental floss details is required",
            consumeAlcoholDetails: "Alcohol consumption details is required",
            participateInSportsDetails: "Sports participation details is required",
            balancedDietDetails: "Balanced diet details is required",
            regularExerciseDetails: "Regular exercise details is required",
            eatingDisordersDetails: "Eating disorders details is required"
        };
    } else if (clinicType === "Psychiatry Clinic") {
        possibleFields = {
            moodDetails: "Mood details are required",
            excessiveWorryOrAnxietyDetails: "Excessive worry or anxiety details are required",
            sleepPatternsDetails: "Sleep patterns details are required",
            appetiteOrWeightDetails: "Appetite or weight details are required",
            sleepChangesDetails: "Sleep changes details are required",
            hopelessnessOrWorthlessnessDetails: "Hopelessness or worthlessness details are required",
            agitationOrImpulsivityDetails: "Agitation or impulsivity details are required",
            difficultyConcentratingDetails: "Difficulty concentrating details are required"
        };
    }

    return Object.entries(possibleFields).map(([field, message]) => {
        return body(field)
            .notEmpty()
            .withMessage(message)
    })
}

const step4DynamicValidationClinicTypesFieldNames = async (clinicType) => {
    let possibleFields = {};
    
    if (clinicType === "Dental Clinic") {
        possibleFields = {
            experienceBleedingDetails: "Experience bleeding details is required",
            toothSensitivityDetails: "Tooth sensitivity details is required",
            dentalAppearanceDetails: "Dental appearance details is required",
            looseTeethDetails: "Loose teeth details is required",
            badBreathOrBadTasteDetails: "Bad breath or bad taste details is required",
            dentalXraysDetails: "Dental X-rays details is required",
            dentalRestorationDetails: "Dental restoration details is required",
            orthodonticTreatmentDetails: "Orthodontic treatment details is required"
        };
    } else if (clinicType === "Psychiatry Clinic") {
        possibleFields = {
            stressLevelsDetails: "Stress levels details are required",
            supportSystemDetails: "Support system details are required",
            majorLifeChangesDetails: "Major life changes details are required",
            substancesDetails: "Substances details are required",
            sleepHoursDetails: "Sleep hours details are required",
            socialGroupsDetails: "Social groups details are required",
            livingSituationDetails: "Living situation details are required",
            copingWithStressDetails: "Coping with stress details are required"
        };
    }

    const fields = Object.entries(possibleFields).map(([field, message]) => {
        return body(field)
            .notEmpty()
            .withMessage(message)
    })

    return fields;
}

const step5DynamicValidationClinicTypesFieldNames = async (clinicType) => {
    let possibleFields = {};
    
    if (clinicType === "Dental Clinic") {
        possibleFields = {
            brushFrequencyDetails: "Brushing frequency is required",
            useMouthWashDetails: "Mouthwash usage details is required",
            replaceToothbrushDetails: "Toothbrush replacement details is required",
            cleanTongueDetails: "Tongue cleaning details is required",
            regularCheckupDetails: "Regular dental checkup details is required",
            dentalAnxietyDetails: "Dental anxiety details is required",
            dentalTraumaDetails: "Dental trauma details is required"
        };
    } else if (clinicType === "Psychiatry Clinic") {
        possibleFields = {
            mentalHealthTreatmentDetails: "Mental health treatment details are required",
            treatmentHistoryDetails: "Treatment history details are required",
            currentlyInTherapyDetails: "Currently in therapy details are required",
            negativeExperienceWithMentalHealthTreatmentDetails: "Negative experience with mental health treatment details are required",
            currentlyUnderCareOfPsychiatristDetails: "Currently under care of psychiatrist details are required",
            stoppedTakingPsychiatricMedicationsDetails: "Stopped taking psychiatric medications details are required",
            sideEffectsFromPsychiatricMedicationsDetails: "Side effects from psychiatric medications details are required",
            consistentWithAttendingTherapyOrTakingMedicationsDetails: "Consistency with therapy or medications details are required"
        };
    }

    const fields = Object.entries(possibleFields)
        .map(([field, message]) => {
            return body(field)
                .notEmpty()
                .withMessage(message)
        });

    return fields;
}

// Combine validations dynamically
const validatePatientConsultation = (step, clinicType) => {
    return [
        async (req, res, next) => {
            let validations = [];
            // parse the step parameter to an integer
            switch (parseInt(step, 10)) {
                case 0:
                    validations = step1Validation;
                    break;
                case 1:
                    validations = await step2DynamicValidationClinicTypesFieldNames(clinicType);
                    break;
                case 2:
                    validations = await step3DynamicValidationClinicTypesFieldNames(clinicType);
                    break;
                case 3:
                    validations = await step4DynamicValidationClinicTypesFieldNames(clinicType);
                    break;
                case 4:
                    validations = await step5DynamicValidationClinicTypesFieldNames(clinicType);
                    break;
                case 5:
                    validations = await step6DynamicValidationClinicTypesFieldNames(clinicType);
                    break;
                default:
                    return [
                        (req, res) => {
                            return res.status(StatusCodes.BAD_REQUEST).json({
                                errors: {
                                    step: "Invalid step provided."
                                },
                            });
                        },
                    ];
            }

            await Promise.all(validations.map((validation) => validation.run(req)))
                .then(() => {
                    const errors = validationResult(req)

                    if (!errors.isEmpty()) {
                        return res.status(StatusCodes.BAD_REQUEST).json({
                            errors: errors.formatWith((err) => err.msg).mapped()
                        })
                    }
                    next()
                })
                .catch(next)
        }
    ]
};

export default validatePatientConsultation;