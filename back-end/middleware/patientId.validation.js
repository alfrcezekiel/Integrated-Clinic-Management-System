import {body, validationResult} from "express-validator" 
import { StatusCodes } from "http-status-codes"

const validateAppointmentID = [
    body("patientID")
        .trim()
        .notEmpty()
        .withMessage("Patient ID is required")
        .isNumeric()
        .withMessage("Invalid Patient ID"),
    (req, res, next) => {
        const errors = validationResult(req)

        if(!errors.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((err) => err.msg).mapped()
            })
        }
        next();
    }
]

export default validateAppointmentID;