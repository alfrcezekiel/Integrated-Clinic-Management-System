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

// Step 2: Medical History
const step2Validation = [
    body("allergiesDetails")
        .notEmpty()
        .withMessage("Allergy details is required"),
    body("takingPrescriptionMedicationDetails")
        .notEmpty()
        .withMessage("Prescription medication details is required"),
    body("chronicConditionDetails")
        .notEmpty()
        .withMessage("Medical condition details are required"),
    body("surgeriesDetails")
        .notEmpty()
        .withMessage("Surgeries details is required"),
    body("jawPainDetails")
        .notEmpty()
        .withMessage("Jaw pain details are required"),
    body("experiencedExcessiveBleedingDetails")
        .notEmpty()
        .withMessage("Experience excessive bleeding details is required"),
    body("heartProblemsDetails")
        .notEmpty()
        .withMessage("Cardiovascular issues details is required"),
    body("advisedTakingAntibioticsDetails")
        .notEmpty()
        .withMessage("Advised taking antibiotics details is required")
];

// Step 3: Lifestyle Information
const step3Validation = [
    body("smokeDetails")
        .notEmpty()
        .withMessage("Smoking details required"),
    body("consumeSugaryFoodsOrDrinksDetails")
        .notEmpty()
        .withMessage("Sugary foods or drinks details is required"),
    body("dentalFlossDetails")
        .notEmpty()
        .withMessage("Dental floss details is required"),
    body("consumeAlcoholDetails")
        .notEmpty()
        .withMessage("Alcohol consumption details is required"),
    body("participateInSportsDetails")
        .notEmpty()
        .withMessage("Sports participation details is required"),
    body("balancedDietDetails")
        .notEmpty()
        .withMessage("Balanced diet details is required"),
    body("regularExerciseDetails")
        .notEmpty()
        .withMessage("Regular exercise details is required"),
    body("eatingDisordersDetails")
        .notEmpty()
        .withMessage("Eating disorders details is required"),
];

// Step 4: Clinic Assessments
const step4Validation = [
    body("diagnosis")
        .notEmpty()
        .withMessage("Diagnosis Details is required"),
    body("symptoms")
        .notEmpty()
        .withMessage("Symptoms Details is required"),
    body("prescription")
        .notEmpty()
        .withMessage("Prescription Details is required"),
    body("treatmentPlan")
        .notEmpty()
        .withMessage("Treatment Plan Details is required"),
    body("bloodPressure")
        .notEmpty()
        .withMessage("Blood pressure details is required"),
    body("heartRate")
        .notEmpty()
        .withMessage("Heart rate is required")
];

// Step 5: Consent and Agreement
const step5Validation = [
    body("consent")
        .notEmpty()
        .withMessage("Consent is required. You must agree to the terms and privacy policy."),
];

// dynamic medical history question based on the retrieved consultation questionnaire in the server
const step2DynamicMedicalHistoryValidation = async () => {
    const possibleFields = {
        allergiesDetails: "Allergy details is required",
        takingPrescriptionMedicationDetails: "Prescription medication details is required",
        chronicConditionDetails: "Medical condition details are required",
        surgeriesDetails: "Surgeries details is required",
        jawPainDetails: "Jaw pain details are required",
        experiencedExcessiveBleedingDetails: "Experience excessive bleeding details is required",
        heartProblemsDetails: "Cardiovascular issues details is required",
        advisedTakingAntibioticsDetails: "Advised taking antibiotics details is required"
    }

    return Object.entries(possibleFields).map(([field, message]) => {
        return body(field)
            .if(body(field).exists())
            .notEmpty()
            .withMessage(message)
    })
}

const step3DynamicLifestyleInformationValidation = async () => {
    const possibleLifestyleInformationFields = {
        smokeDetails: "Smoking details required",
        consumeSugaryFoodsOrDrinksDetails: "Sugary foods or drinks details is required",
        dentalFlossDetails: "Dental floss details is required",
        consumeAlcoholDetails: "Alcohol consumption details is required",
        participateInSportsDetails: "Sports participation details is required",
        balancedDietDetails: "Balanced diet details is required",
        regularExerciseDetails: "Regular exercise details is required",
        eatingDisordersDetails: "Eating disorders details is required"
    }

    return Object.entries(possibleLifestyleInformationFields).map(([field, message]) => {
        return body(field)
            .if(body(field).exists())
            .notEmpty()
            .withMessage(message)
    })
}

const step4DynamicClinicalAssessmentValidation = async () => {
    const possibleClinicalAssessmentFields = {
        experienceBleedingDetails: "Experience bleeding details is required",
        toothSensitivityDetails: "Tooth sensitivity details is required",
        dentalAppearanceDetails: "Dental appearance details is required",
        looseTeethDetails: "Loose teeth details is required",
        badBreathOrBadTasteDetails: "Bad breath or bad taste details is required",
        dentalXraysDetails: "Dental X-rays details is required",
        dentalRestorationDetails: "Dental restoration details is required",
        orthodonticTreatmentDetails: "Orthodontic treatment details is required"
    }

    const fields = Object.entries(possibleClinicalAssessmentFields).map(([field, message]) => {
        return body(field)
            .if(body(field).exists())
            .notEmpty()
            .withMessage(message)
    })

    return fields;
}

const step5DynamicOralHygieneValidation = async () => {
    const possibleOralHygieneFields = {
        brushFrequencyDetails: "Brushing frequency is required",
        useMouthWashDetails: "Mouthwash usage details is required",
        replaceToothbrushDetails: "Toothbrush replacement details is required",
        cleanTongueDetails: "Tongue cleaning details is required",
        regularCheckupDetails: "Regular dental checkup details is required",
        dentalAnxietyDetails: "Dental anxiety details is required",
        dentalTraumaDetails: "Dental trauma details is required"
    };

    const oralHygieneFields = Object.entries(possibleOralHygieneFields)
        .map(([field, message]) => {
            return body(field)
                .if(body(field).exists())
                .notEmpty()
                .withMessage(message)
        });

    return oralHygieneFields;
}

// Combine validations dynamically
const validatePatientConsultation = (step) => {
    return [
        async (req, res, next) => {
            let validations = [];
            // parse the step parameter to an integer
            switch (parseInt(step, 10)) {
                case 0:
                    validations = step1Validation;
                    break;
                case 1:
                    validations = await step2DynamicMedicalHistoryValidation(req);
                    break;
                case 2:
                    validations = await step3DynamicLifestyleInformationValidation(req);
                    break;
                case 3:
                    validations = await step4DynamicClinicalAssessmentValidation(req);
                    break;
                case 4:
                    validations = await step5DynamicOralHygieneValidation(req);
                    break;
                case 5:
                    validations = step5Validation;
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