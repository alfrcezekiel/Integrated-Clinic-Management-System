import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

const validateRegister = [
    body("firstName")
        .trim().
        notEmpty().
        withMessage("First name is required"),
    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last name is required"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid email format"),
    body("phoneNumber")
        .trim()
        .notEmpty().withMessage("Phone number is required")
        .isLength({ min: 11, max: 11 }).withMessage("Phone number should be 11 digits"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("confirmPassword")
        .notEmpty().withMessage("Confirm password is required")
        .custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error("Password do not match");
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.formatWith((error) => error.msg).mapped()
            })
        }
        next();
    }
]

export default validateRegister;