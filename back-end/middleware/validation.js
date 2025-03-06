import { body, validationResult } from 'express-validator';
import { StatusCodes } from 'http-status-codes';

const validateRegister = [
    body("firstName")
        .trim().
        notEmpty().
        withMessage("First Name is required"),
    body("lastName")
        .trim()
        .notEmpty()
        .withMessage("Last Name is required"),
    body("email")
        .trim()
        .notEmpty().withMessage("Email is required")
        .isEmail().withMessage("Invalid Email Format"),
    body("phoneNumber")
        .trim()
        .notEmpty().withMessage("Phone Number is required")
        .isLength({min: 11, max: 11})
        .withMessage("Phone Number should be 11 digits"),
    body("password")
        .notEmpty().withMessage("Password is required")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),
    body("confirmPassword")
        .notEmpty().withMessage("Confirm Password is required")
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
                errors: errors.formatWith((err) => err.msg).mapped()
            })
        }
        next();
    }
]

export default validateRegister;