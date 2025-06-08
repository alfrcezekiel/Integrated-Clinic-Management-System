import { StatusCodes } from "http-status-codes";
import {body, validationResult} from "express-validator"

// validation for contact us
const validateContacts = [
    body("contactName")
        .notEmpty()
        .withMessage("This field is required"),
    body("contactEmailAddress")
        .notEmpty()
        .withMessage("This field is required")
        .isEmail()
        .withMessage("Invalid email address"),
    body("contactSubject")
        .notEmpty()
        .withMessage("This field is required"),
    body("contactMessage")
        .notEmpty()
        .withMessage("This field is required"),
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

export default validateContacts;