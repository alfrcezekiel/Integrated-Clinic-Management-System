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

// Combine validations dynamically
const validatePatientConsultation = (step) => {
    let validations = [];
    // parse the step parameter to an integet
    switch (parseInt(step, 10)) {
        case 0:
            validations = step1Validation;
            break;
        case 1:
            validations = step2Validation;
            break;
        case 2:
            validations = step3Validation;
            break;
        case 3:
            validations = step4Validation;
            break;
        case 4:
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

    return [
        ...validations,
        (req, res, next) => {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    errors: errors.formatWith((error) => error.msg).mapped(),
                });
            }
            next();
        },
    ];
};

export default validatePatientConsultation;