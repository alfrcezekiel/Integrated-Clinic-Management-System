import {body, validationResult} from "express-validator"
import { StatusCodes } from "http-status-codes"

const validateUpdatingDoctor = [
    body('firstName')
        .notEmpty()
        .withMessage('First name is required'),
    body('lastName')
        .notEmpty()
        .withMessage('Last name is required'),
    body('email')
        .notEmpty()
        .withMessage('Email is required')
        .isEmail()
        .withMessage('Invalid email address'),
    body('medicalSpecialties')
        .notEmpty()
        .withMessage('Medical specialty is required'),
    body('yearsOfExperience')
        .notEmpty()
        .withMessage('Years of experience is required')
        .isInt({ min: 0 })
        .withMessage('Years of experience must be a non-negative integer'),
    body('consultationFee')
        .notEmpty()
        .withMessage('Consultation fee is required')
        .isFloat({ min: 0 })
        .withMessage('Consultation fee must be a non-negative number'),
    body('gender')
        .notEmpty()
        .withMessage("Gender is required")
        .isIn(['Male', 'Female'])
        .withMessage('Gender must be either Male or Female'),
    body('password')
        .notEmpty()
        .withMessage('Password is required')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters long'),
    (req, res, next) => {
        const errors = validationResult(req);

        if(!errors.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((err) => err.msg).mapped()
            })
        }
        next();
    }
];

export default validateUpdatingDoctor