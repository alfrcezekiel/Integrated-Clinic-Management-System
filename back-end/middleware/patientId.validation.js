import {body, validationResult} from "express-validator" 
import { StatusCodes } from "http-status-codes"

const validateAppointmentID = [
    body("patientID")
        .trim()
        .notEmpty()
        .withMessage("This field is required")
        .isNumeric()
        .withMessage("Invalid Appointment ID"),
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