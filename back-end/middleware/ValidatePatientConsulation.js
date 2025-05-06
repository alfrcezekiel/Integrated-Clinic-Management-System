import { StatusCodes } from "http-status-codes";
import { body, validationResult } from "express-validator";

const validatePatientConsultation = [
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
    body("appointmentTime")
        .notEmpty()
        .withMessage("Appointment time is required"),
    body("hasMedicalConditions")
        .isIn(["Yes", "No"])
        .withMessage("Medical Condition Status is required"),
    body("medicalConditionDetails")
        .if(body("hasMedicalConditions").equals("Yes"))
        .notEmpty()
        .withMessage("Medical Condition Details are required"),
    body("takingMedications")
        .isIn(["Yes", "No"])
        .withMessage("Taking Medication Status is required"),
    body("medicationDetails")
        .if(body("takingMedications").equals("Yes"))
        .notEmpty()
        .withMessage("Medication Details are required"),
    body("smokes")
        .isIn(["Yes", "No"])
        .withMessage("Smoking Status is required"),
    body("smokeFrequency")
        .if(body("smokes").equals("Yes"))
        .notEmpty()
        .withMessage("Smoking Frequency details required"),
    body("hasAllergies")
        .isIn(["Yes", "No"])
        .withMessage("Allergy Status is required"),
    body("allergyDetails")
        .if(body("hasAllergies").equals("Yes"))
        .notEmpty()
        .withMessage("Allergy Details are required"),
    body("drinksAlcohol")
        .isIn(["Yes", "No"])
        .withMessage("Alcohol Consumption Status is required"),
    body("alcoholFrequency")
        .if(body("drinksAlcohol").equals("Yes"))
        .notEmpty()
        .withMessage("Alcohol Consumption Frequency is required"),
    body("diagnosis")
        .notEmpty()
        .withMessage("Diagnosis Details is  required"),
    body("symptoms")
        .notEmpty()
        .withMessage("Symptoms Details is required"),
    body("prescription")
        .notEmpty()
        .withMessage("Prescription Details is required"),
    (req, res, next) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((error) => error.msg).mapped()
            });
        }
        next();
    }
]

export default validatePatientConsultation;