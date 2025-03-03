import {body, check, validationResult} from 'express-validator';
import { StatusCodes } from 'http-status-codes';

const validateRegister = [
    body("firstName").notEmpty().withMessage("First name is required"),
    body("lastName").notEmpty().withMessage("Last name is required"),
    body("email").notEmpty().withMessage("Email is required"),
    body("email").isEmail().withMessage("Invalid email"),
    body("phoneNumber").notEmpty().withMessage("Phone number is required"),
    body("phoneNumber").isLength(11).withMessage("Phone number should be 11 digits"),
    body("password").notEmpty().withMessage("Password is required"),
    body("password").isLength({min: 8}).withMessage("Password must be at least 8 characters"),
    body("confirmPassword").notEmpty().withMessage("Confirm password is required"),
    body("confirmPassword").custom((value, {req}) => {
        if(value !== req.body.password){
            throw new Error("Password do not match");
        }
        return true;
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if(!errors.isEmpty()){
            return res.status(StatusCodes.BAD_REQUEST).json({
                errors: errors.array().map((error) => {
                    return {
                        message: error.msg
                    }
                })
            })
        }
        next();
    }
]

export default validateRegister;