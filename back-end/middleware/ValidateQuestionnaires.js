import {body, validationResult} from "express-validator";
import { StatusCodes } from "http-status-codes";

const validateQuestionnaires = [
    body("responses")
        .isArray()
        .withMessage("Responses must be an array"),
    body("responses.*.clinic_id")
        .notEmpty()
        .withMessage("Clinic ID is required"),
    body("responses.*.clinic_name")
        .notEmpty()
        .withMessage("Clinic name is required"),
    body("responses.*.clinic_type")
        .notEmpty()
        .withMessage("Clinic type is required"),
    body("responses.*.section")
        .notEmpty()
        .withMessage("Section is required"),
    body("responses.*.question")
        .notEmpty()
        .withMessage("Question is required"),
    body("responses.*.answer")
        .notEmpty()
        .withMessage("Answer is required")
        .isIn(["Yes", "No"])
        .withMessage("Answer must be either 'Yes' or 'No'"),
    body("responses.*.adminID")
        .notEmpty()
        .withMessage("Admin ID is required"),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((error) => error.msg).mapped()
            })
        }
        next();
    }
]

export default validateQuestionnaires;