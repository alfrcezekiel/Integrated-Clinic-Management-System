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
    body("whatBringsYouHereDetails")
        .notEmpty()
        .withMessage("What brings you here today details is required"),
    body("symptomsDetails")
        .notEmpty()
        .withMessage("Symptoms details is required"),
    body("medicalConditionDetails")
        .notEmpty()
        .withMessage("Medical condition details are required"),
    body("symptomsStartDetails")
        .notEmpty()
        .withMessage("Symptoms start date started is required"),
    body("medicationDetails")
        .notEmpty()
        .withMessage("Medication details are required"),
    body("surgeryDetails")
        .notEmpty()
        .withMessage("Surgery details are required"),
    body("experienceIssueDetails")
        .notEmpty()
        .withMessage("Experience issue details is required"),
    body("vaccinationDetails")
        .notEmpty()
        .withMessage("Vaccination details is required")
];

// Step 3: Lifestyle Information
const step3Validation = [
    body("smokeFrequency")
        .notEmpty()
        .withMessage("Smoking Frequency details required"),
    body("allergyDetails")
        .notEmpty()
        .withMessage("Allergy Details are required"),
    body("alcoholFrequency")
        .notEmpty()
        .withMessage("Alcohol Consumption Frequency is required"),
    body("exerciseFrequency")
        .notEmpty()
        .withMessage("Exercise Frequency Details is required"),
    body("sleepHours")
        .notEmpty()
        .withMessage("Sleep hours details is required"),
    body("stressFrequency")
        .notEmpty()
        .withMessage("Stress frequency details is required"),
    body("dietarySupplements")
        .notEmpty()
        .withMessage("Dietary supplements details is required"),
    body("waterIntake")
        .notEmpty()
        .withMessage("Water intake details is required")
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