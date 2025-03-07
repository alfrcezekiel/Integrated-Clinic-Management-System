import { StatusCodes } from "http-status-codes";
import {body, validationResult} from "express-validator"

// validation for contact us
const validateContacts = [
    body("contactFirstName")
        .trim()
        .notEmpty()
        .withMessage("This field is required"),
    body("contactEmailAddress")
        .trim()
        .isEmail()
        .withMessage("Invalid Email Format")
        .notEmpty()
        .withMessage("This field is required"),
    body("contactSubject")
        .trim()
        .notEmpty()
        .withMessage("This field is required"),
    body("contactMessage")
        .trim()
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